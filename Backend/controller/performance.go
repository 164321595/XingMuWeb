package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"ticket-system-backend/model"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
)

// PerformanceController 演出控制器
type PerformanceController struct{}

// GetPerformanceList 获取演出列表
func (pc *PerformanceController) GetPerformanceList(c *gin.Context) {
	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	categoryID, _ := strconv.Atoi(c.DefaultQuery("categoryId", "0"))
	keyword := c.DefaultQuery("keyword", "")
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1")) // 默认-1表示不筛选状态，0:未开售,1:预售,2:在售,3:售罄,4:已结束

	// 构建查询条件
	query := model.PerformanceQuery{
		CategoryID: categoryID,
		Keyword:    keyword,
		Status:     status,
		Page:       page,
		Size:       pageSize,
	}

	// 查询演出列表
	performances, total, err := model.GetPerformances(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "查询演出列表失败"))
		return
	}

	// 构造响应数据
	response := map[string]interface{}{
		"list":     performances,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GetPerformanceByID 获取演出详情
func (pc *PerformanceController) GetPerformanceByID(c *gin.Context) {
	// 获取演出ID
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的演出ID"))
		return
	}

	// 查询演出详情
	performance, err := model.GetPerformanceByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取演出详情失败"))
		return
	}

	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, ""))
		return
	}

	ticketTypes, err := model.GetTicketTypesByPerformanceID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取票种信息失败"))
		return
	}

	// 构造响应数据
	response := map[string]interface{}{
		"performance": performance,
		"ticketTypes": ticketTypes,
	}

	c.JSON(http.StatusOK, util.SuccessResponse(response))
}

// GetCategories 获取所有分类
func (pc *PerformanceController) GetCategories(c *gin.Context) {
	// 查询所有分类
	categories, err := model.GetAllCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取分类列表失败"))
		return
	}

	c.JSON(http.StatusOK, util.SuccessResponse(categories))
}

// UploadCoverImage 上传演出封面图片
func (pc *PerformanceController) UploadCoverImage(c *gin.Context) {
	// 获取演出ID
	performanceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "无效的演出ID"))
		return
	}

	// 检查演出是否存在
	performance, err := model.GetPerformanceByID(performanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "获取演出信息失败"))
		return
	}
	if performance == nil {
		c.JSON(http.StatusNotFound, util.ErrorResponse(util.StatusCodePerformanceNotExist, "演出不存在"))
		return
	}

	// 读取文件
	file, err := c.FormFile("cover")
	if err != nil {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "请上传封面图片"))
		return
	}

	// 检查文件类型
	allowedTypes := []string{"image/jpeg", "image/png", "image/gif", "image/webp"}
	contentType := file.Header.Get("Content-Type")
	if !util.ValidateFileType(contentType, allowedTypes) {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "只允许上传JPG、PNG、GIF、WebP格式的图片"))
		return
	}

	// 检查文件大小（限制为5MB）
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, util.ErrorResponse(util.StatusCodeBadRequest, "封面图片大小不能超过5MB"))
		return
	}

	// 创建上传目录
	uploadDir := "uploads/covers"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "创建上传目录失败"))
		return
	}

	// 生成唯一文件名
	fileExt := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%d_%d%s", performanceID, time.Now().Unix(), fileExt)
	savePath := filepath.Join(uploadDir, fileName)

	// 保存文件
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "保存封面图片失败"))
		return
	}

	// 更新演出封面路径
	performance.CoverImage = "/" + savePath
	if err := model.UpdatePerformance(performance); err != nil {
		c.JSON(http.StatusInternalServerError, util.ErrorResponse(util.StatusCodeInternalError, "更新演出信息失败"))
		return
	}

	// 返回成功响应
	c.JSON(http.StatusOK, util.SuccessResponse(map[string]interface{}{
		"cover_image": performance.CoverImage,
	}))
}
