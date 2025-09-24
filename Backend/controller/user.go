package controller

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"ticket-system-backend/model"
	"ticket-system-backend/util"
)

// UserController 用户控制器
type UserController struct {}

// Register 用户注册
func (uc *UserController) Register(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required,min=3,max=20"`
		Password string `json:"password" binding:"required,min=6,max=20"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 检查用户是否已存在
	existingUser, _ := model.GetUserByUsername(request.Username)
	if existingUser != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeUserExist, ""))
		return
	}

	// 创建新用户
	user := &model.User{
		Username:  request.Username,
		Password:  encryptPassword(request.Password),
		Phone:     request.Phone,
		Email:     request.Email,
		Avatar:    "/uploads/avatars/default.png", // 设置默认头像
		Status:    1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := model.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 创建用户隐私设置
	setting := &model.UserPrivacySetting{
		UserID:           user.ID,
		DataCollection:   1,    // 1:允许
		PersonalizedAds:  1,    // 1:允许
		ThirdPartySharing: 0,    // 0:禁止 (数据库默认值)
		MarketingEmails:  1,    // 1:允许
	}

	if err := model.CreateUserPrivacySetting(setting); err != nil {
		// 记录错误但继续处理，因为用户创建已经成功
		// 在实际生产环境中，应该考虑事务处理或回滚机制
		fmt.Println("创建用户隐私设置失败:", err)
	}

	// 返回用户信息，不包含密码
	response := struct {
		ID        int       `json:"id"`
		Username  string    `json:"username"`
		CreatedAt time.Time `json:"created_at"`
	}{user.ID, user.Username, user.CreatedAt}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// Login 用户登录
func (uc *UserController) Login(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查找用户
	user, err := model.GetUserByUsername(request.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, ""))
		return
	}

	// 验证密码
	if user.Password != encryptPassword(request.Password) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, ""))
		return
	}

	// 生成JWT令牌
	token, err := util.GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 返回用户信息和token
	response := struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar"`
		Token    string `json:"token"`
	}{user.ID, user.Username, user.Phone, user.Email, user.Avatar, token}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GetUserInfo 获取用户信息
func (uc *UserController) GetUserInfo(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 查询用户信息
	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 返回用户信息，不包含密码
	response := struct {
		ID        int       `json:"id"`
		Username  string    `json:"username"`
		Phone     string    `json:"phone"`
		Email     string    `json:"email"`
		Avatar    string    `json:"avatar"`
		Status    int       `json:"status"`
		CreatedAt time.Time `json:"created_at"`
		UpdatedAt time.Time `json:"updated_at"`
	}{user.ID, user.Username, user.Phone, user.Email, user.Avatar, user.Status, user.CreatedAt, user.UpdatedAt}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// UpdateUserInfo 更新用户信息
func (uc *UserController) UpdateUserInfo(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		Phone  string `json:"phone"`
		Email  string `json:"email"`
		Avatar string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查询用户
	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 更新用户信息
	user.Phone = request.Phone
	user.Email = request.Email
	user.Avatar = request.Avatar
	user.UpdatedAt = time.Now()

	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

// 简单的密码加密函数（实际项目中应该使用更安全的加密方式）
func encryptPassword(password string) string {
	hash := md5.Sum([]byte(password))
	return hex.EncodeToString(hash[:])
}

// ChangePassword 修改密码
func (uc *UserController) ChangePassword(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required,min=6,max=20"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查询用户
	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 验证当前密码
	if user.Password != encryptPassword(request.CurrentPassword) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, "当前密码错误"))
		return
	}

	// 更新密码
	user.Password = encryptPassword(request.NewPassword)
	user.UpdatedAt = time.Now()

	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

// GetPrivacySettings 获取用户隐私设置
func (uc *UserController) GetPrivacySettings(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 查询用户隐私设置
	setting, err := model.GetUserPrivacySettingByUserID(userID.(int))
	if err != nil {
		// 如果不存在，返回默认设置
		response := struct {
			DataCollection bool `json:"dataCollection"`
			PersonalizedAds bool `json:"personalizedAds"`
			ThirdPartySharing bool `json:"thirdPartySharing"`
			MarketingEmails bool `json:"marketingEmails"`
		}{true, true, false, true}
		c.JSON(http.StatusOK, util.SuccessResponse(response))
		return
	}

	// 构建响应数据，将int8转换为bool
	response := struct {
		DataCollection bool `json:"dataCollection"`
		PersonalizedAds bool `json:"personalizedAds"`
		ThirdPartySharing bool `json:"thirdPartySharing"`
		MarketingEmails bool `json:"marketingEmails"`
	}{setting.DataCollection == 1, setting.PersonalizedAds == 1, setting.ThirdPartySharing == 1, setting.MarketingEmails == 1}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// UpdatePrivacySettings 更新用户隐私设置
func (uc *UserController) UpdatePrivacySettings(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		DataCollection bool `json:"dataCollection"`
		PersonalizedAds bool `json:"personalizedAds"`
		ThirdPartySharing bool `json:"thirdPartySharing"`
		MarketingEmails bool `json:"marketingEmails"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查找用户隐私设置
	setting, err := model.GetUserPrivacySettingByUserID(userID.(int))
	if err != nil {
		// 如果不存在，创建新的隐私设置
		setting = &model.UserPrivacySetting{
			UserID: userID.(int),
		}
	}

	// 更新隐私设置，将bool转换为int8
	if request.DataCollection {
		setting.DataCollection = 1
	} else {
		setting.DataCollection = 0
	}
	if request.PersonalizedAds {
		setting.PersonalizedAds = 1
	} else {
		setting.PersonalizedAds = 0
	}
	if request.ThirdPartySharing {
		setting.ThirdPartySharing = 1
	} else {
		setting.ThirdPartySharing = 0
	}
	if request.MarketingEmails {
		setting.MarketingEmails = 1
	} else {
		setting.MarketingEmails = 0
	}
	setting.UpdatedAt = time.Now()

	// 保存更新
	if setting.ID == 0 {
		// 新记录
		if err := model.CreateUserPrivacySetting(setting); err != nil {
			c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
			return
		}
	} else {
		// 现有记录
		if err := model.UpdateUserPrivacySetting(setting); err != nil {
			c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
			return
		}
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

// ExportUserData 导出用户数据
func (uc *UserController) ExportUserData(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 模拟生成下载链接
	expireTime := time.Now().Add(24 * time.Hour)
	response := struct {
		DownloadUrl string `json:"downloadUrl"`
		ExpiresAt string `json:"expiresAt"`
	}{"/api/download/user-data/" + strconv.Itoa(userID.(int)), expireTime.Format(time.RFC3339)}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// UploadAvatar 上传头像
func (uc *UserController) UploadAvatar(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	// 读取文件
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请上传头像文件"))
		return
	}

	// 检查文件类型
	allowedTypes := []string{"image/jpeg", "image/png", "image/gif"}
	contentType := file.Header.Get("Content-Type")
	isAllowed := false
	for _, t := range allowedTypes {
		if contentType == t {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "只允许上传JPG、PNG、GIF格式的图片"))
		return
	}

	// 检查文件大小（限制为2MB）
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "头像文件大小不能超过2MB"))
		return
	}

	// 创建上传目录
	uploadDir := "uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建上传目录失败"))
		return
	}

	// 生成唯一文件名
	fileExt := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d_%d%s", userID, time.Now().Unix(), fileExt)
	savePath := filepath.Join(uploadDir, fileName)

	// 保存文件
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "保存头像文件失败"))
		return
	}

	// 更新用户头像路径
	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取用户信息失败"))
		return
	}

	user.Avatar = "/" + savePath
	user.UpdatedAt = time.Now()

	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "更新用户头像失败"))
		return
	}

	// 返回新的头像URL
	c.JSON(http.StatusOK, util.SuccessResponse(map[string]string{
		"avatar": user.Avatar,
	}))
}

// DeleteUserData 删除用户数据
func (uc *UserController) DeleteUserData(c *gin.Context) {
	// 从上下文获取用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		ConfirmPassword string `json:"confirmPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, err.Error()))
		return
	}

	// 查询用户
	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, err.Error()))
		return
	}

	// 验证密码
	if user.Password != encryptPassword(request.ConfirmPassword) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, "密码错误"))
		return
	}

	// 删除用户数据（这里简化处理，实际应根据业务需求进行数据处理）

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}