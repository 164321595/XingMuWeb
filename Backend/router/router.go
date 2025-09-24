package router

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"os"
	"strings"
	"ticket-system-backend/controller"
	"ticket-system-backend/middleware"
)

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	// 创建路由引擎
	r := gin.Default()

	// 配置JSON响应使用UTF-8编码
	gin.DefaultWriter = io.MultiWriter(os.Stdout)
	gin.SetMode(gin.ReleaseMode)
	// 添加全局中间件强制设置所有响应头的Content-Type为application/json; charset=utf-8
r.Use(func(c *gin.Context) {
	// 确保所有响应都使用UTF-8编码
	c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	c.Next()
})

// 配置自定义JSON响应方法，确保中文正确显示
r.Use(func(c *gin.Context) {
	c.Set("JSONResponse", func(code int, obj interface{}) {
		c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
		c.Writer.WriteHeader(code)
		// 使用标准库JSON序列化器确保UTF-8编码
		encoder := json.NewEncoder(c.Writer)
		encoder.SetEscapeHTML(false) // 不转义HTML特殊字符
		if err := encoder.Encode(obj); err != nil {
			c.String(http.StatusInternalServerError, err.Error())
		}
	})
	c.Next()
})

	// 健康检查路由 - 用于Docker容器健康状态监控
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "UP",
			"message": "Service is running normally",
		})
	})

	// 全局中间件
r.Use(gin.Recovery())
// 添加API前缀重定向中间件
r.Use(apiPrefixMiddleware())
// 允许跨域
r.Use(corsMiddleware())

	// 不需要认证的路由组
	api := r.Group("/api")
	{
		// 用户认证相关路由
		auth := api.Group("/auth")
		{
			uc := &controller.UserController{}
			auth.POST("/register", uc.Register)
			auth.POST("/login", uc.Login)
		}

		// 演出相关路由
		performance := api.Group("/performances")
		{
			pc := &controller.PerformanceController{}
			performance.GET("", pc.GetPerformanceList)
			performance.GET("/:id", pc.GetPerformanceByID)
			performance.GET("/categories", pc.GetCategories)
			// 封面上传需要认证
			performance.POST("/:id/cover", middleware.JWTAuthMiddleware(), pc.UploadCoverImage)
		}

		// 票种相关路由
	ticket := api.Group("/tickets")
	{
		tc := &controller.TicketController{}
		ticket.GET("/seckill", tc.SeckillTicket)
	}
	}

	// 需要认证的路由组
	auth := r.Group("/api")
	auth.Use(middleware.JWTAuthMiddleware())
	{
		// 用户相关路由
		user := auth.Group("/users")
		{
			uc := &controller.UserController{}
			user.GET("/current", uc.GetUserInfo)
			user.PUT("/current", uc.UpdateUserInfo)
			user.POST("/current/change-password", uc.ChangePassword)
			user.GET("/current/privacy-settings", uc.GetPrivacySettings)
			user.PUT("/current/privacy-settings", uc.UpdatePrivacySettings)
			user.POST("/current/export-data", uc.ExportUserData)
			user.POST("/current/delete-data", uc.DeleteUserData)
			user.POST("/current/avatar", uc.UploadAvatar)
		}

		// 订单相关路由
		order := auth.Group("/orders")
		{
			oc := &controller.OrderController{}
			order.POST("/from-seckill", oc.CreateOrderFromSeckill)
			order.GET("", oc.GetUserOrders)
			order.GET("/:id", oc.GetOrderDetail)
			order.POST("/:id/cancel", oc.CancelOrder)
			order.POST("/:id/pay", oc.PayOrder)
			order.POST("/:id/refund", oc.RefundOrder)
		}

		// 票种相关路由
	ticket := auth.Group("/tickets")
	{
		tc := &controller.TicketController{}
		ticket.POST("/seckill", tc.SeckillTicket)
	}

		// 演出票种相关路由
		ticketPerformance := auth.Group("/tickets")
		{
			tc := &controller.TicketController{}
			ticketPerformance.GET("/performance/:performanceId", tc.GetTicketTypesByPerformanceID)
			ticketPerformance.POST("/performance/:performanceId/:ticketTypeId/update-stock", tc.UpdateTicketStock)
		}
	}

	return r
}

// 跨域中间件
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取请求的Origin
		origin := c.Request.Header.Get("Origin")
		
		// 允许的Origin列表
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost",
		}
		
		// 检查请求的Origin是否在允许列表中
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}
		
		// 如果是允许的Origin，设置Access-Control-Allow-Origin
		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		
		// 允许凭证（cookie、授权头等）
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		// 允许的HTTP方法
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD")
		// 允许的请求头
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Token, X-Token, X-CSRF-Token")
		// 允许暴露的响应头
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		// 设置预检请求的缓存时间（秒）
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		// 处理预检请求
		if c.Request.Method == "OPTIONS" {
			c.JSON(http.StatusOK, gin.H{"message": "预检请求成功"})
			c.Abort()
			return
		}

		// 继续处理请求
		c.Next()
	}
}

// ServeStaticFiles 静态文件服务
func ServeStaticFiles(r *gin.Engine) {
	// 提供静态文件服务
	uploadsDir := "uploads"
	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		// 如果目录不存在，创建它
		os.MkdirAll(uploadsDir, 0755)
	}

	// 注册静态文件路由
	r.StaticFS("/uploads", http.Dir(uploadsDir))
}

// API前缀重定向中间件
func apiPrefixMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取请求路径
		path := c.Request.URL.Path
		
		// 检查路径是否已经包含/api前缀
		// 同时排除一些特殊路径如favicon.ico, swagger, uploads等
		if !strings.HasPrefix(path, "/api/") && 
			!strings.HasPrefix(path, "/favicon.ico") && 
			!strings.HasPrefix(path, "/swagger/") &&
			!strings.HasPrefix(path, "/uploads/") &&
			path != "/" &&
			path != "/health" {
			// 构建重定向路径
			redirectPath := "/api" + path
			
			// 保留查询参数
			if c.Request.URL.RawQuery != "" {
				redirectPath += "?" + c.Request.URL.RawQuery
			}
			
			// 使用307重定向以保留原始请求方法
			c.Status(http.StatusTemporaryRedirect)
			c.Header("Location", redirectPath)
			c.Abort()
			return
		}
		
		// 继续处理请求
		c.Next()
	}
}