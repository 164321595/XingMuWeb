package controller

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type UserController struct{}

func (uc *UserController) Register(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required,min=3,max=20"`
		Password string `json:"password" binding:"required,min=8,max=20"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	if valid, msg := util.ValidatePasswordStrength(request.Password); !valid {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, msg))
		return
	}

	existingUser, _ := model.GetUserByUsername(request.Username)
	if existingUser != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeUserExist, ""))
		return
	}

	hashedPassword, err := util.HashPassword(request.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "密码加密失败"))
		return
	}

	user := &model.User{
		Username:  request.Username,
		Password:  hashedPassword,
		Phone:     request.Phone,
		Email:     request.Email,
		Avatar:    "/uploads/avatars/default.png",
		Status:    1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := model.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建用户失败"))
		return
	}

	setting := &model.UserPrivacySetting{
		UserID:            user.ID,
		DataCollection:    1,
		PersonalizedAds:   1,
		ThirdPartySharing: 0,
		MarketingEmails:   1,
	}

	if err := model.CreateUserPrivacySetting(setting); err != nil {
		fmt.Println("创建用户隐私设置失败:", err)
	}

	response := struct {
		ID        int       `json:"id"`
		Username  string    `json:"username"`
		CreatedAt time.Time `json:"created_at"`
	}{user.ID, user.Username, user.CreatedAt}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (uc *UserController) Login(c *gin.Context) {
	var request struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	user, err := model.GetUserByUsername(request.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, ""))
		return
	}

	if !util.CheckPassword(request.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, ""))
		return
	}

	token, err := util.GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "生成登录凭证失败"))
		return
	}

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

func (uc *UserController) GetUserInfo(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, "用户不存在，请重新登录"))
			return
		}
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取用户信息失败"))
		return
	}

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

func (uc *UserController) UpdateUserInfo(c *gin.Context) {
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
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取用户信息失败"))
		return
	}

	user.Phone = request.Phone
	user.Email = request.Email
	user.Avatar = request.Avatar
	user.UpdatedAt = time.Now()

	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "更新用户信息失败"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

func (uc *UserController) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=8,max=20"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	if valid, msg := util.ValidatePasswordStrength(request.NewPassword); !valid {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, msg))
		return
	}

	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取用户信息失败"))
		return
	}

	if !util.CheckPassword(request.CurrentPassword, user.Password) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, "当前密码错误"))
		return
	}

	hashedPassword, err := util.HashPassword(request.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "密码加密失败"))
		return
	}

	user.Password = hashedPassword
	user.UpdatedAt = time.Now()

	if err := model.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "更新用户信息失败"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

func (uc *UserController) GetPrivacySettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	setting, err := model.GetUserPrivacySettingByUserID(userID.(int))
	if err != nil {
		response := struct {
			DataCollection    bool `json:"dataCollection"`
			PersonalizedAds   bool `json:"personalizedAds"`
			ThirdPartySharing bool `json:"thirdPartySharing"`
			MarketingEmails   bool `json:"marketingEmails"`
		}{true, true, false, true}
		c.JSON(http.StatusOK, util.SuccessResponse(response))
		return
	}

	response := struct {
		DataCollection    bool `json:"dataCollection"`
		PersonalizedAds   bool `json:"personalizedAds"`
		ThirdPartySharing bool `json:"thirdPartySharing"`
		MarketingEmails   bool `json:"marketingEmails"`
	}{setting.DataCollection == 1, setting.PersonalizedAds == 1, setting.ThirdPartySharing == 1, setting.MarketingEmails == 1}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (uc *UserController) UpdatePrivacySettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		DataCollection    bool `json:"dataCollection"`
		PersonalizedAds   bool `json:"personalizedAds"`
		ThirdPartySharing bool `json:"thirdPartySharing"`
		MarketingEmails   bool `json:"marketingEmails"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	setting, err := model.GetUserPrivacySettingByUserID(userID.(int))
	if err != nil {
		setting = &model.UserPrivacySetting{
			UserID: userID.(int),
		}
	}

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

	if setting.ID == 0 {
		if err := model.CreateUserPrivacySetting(setting); err != nil {
			c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建隐私设置失败"))
			return
		}
	} else {
		if err := model.UpdateUserPrivacySetting(setting); err != nil {
			c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "更新隐私设置失败"))
			return
		}
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}

func (uc *UserController) ExportUserData(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	expireTime := time.Now().Add(24 * time.Hour)
	response := struct {
		DownloadUrl string `json:"downloadUrl"`
		ExpiresAt   string `json:"expiresAt"`
	}{"/api/download/user-data/" + strconv.Itoa(userID.(int)), expireTime.Format(time.RFC3339)}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

func (uc *UserController) UploadAvatar(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请上传头像文件"))
		return
	}

	allowedTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
	contentType := file.Header.Get("Content-Type")
	if !util.ValidateFileType(contentType, allowedTypes) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "只允许上传JPG、PNG、GIF、WebP格式的图片"))
		return
	}

	cfg := util.GetConfig()
	if file.Size > cfg.Upload.MaxSize {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "头像文件大小不能超过2MB"))
		return
	}

	uploadDir := cfg.Upload.Path + "/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建上传目录失败"))
		return
	}

	fileExt := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d_%d%s", userID, time.Now().Unix(), fileExt)
	savePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "保存头像文件失败"))
		return
	}

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

	c.JSON(http.StatusOK, util.SuccessResponse(map[string]string{
		"avatar": user.Avatar,
	}))
}

func (uc *UserController) DeleteUserData(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUnauthorized, ""))
		return
	}

	var request struct {
		ConfirmPassword string `json:"confirmPassword" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请求参数错误"))
		return
	}

	user, err := model.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取用户信息失败"))
		return
	}

	if !util.CheckPassword(request.ConfirmPassword, user.Password) {
		c.JSON(http.StatusUnauthorized, util.ErrorResponse(util.StatusCodeUserPasswordError, "密码错误"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(nil))
}
