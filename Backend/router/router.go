package router

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"ticket-system-backend/controller"
	"ticket-system-backend/middleware"
	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	gin.DefaultWriter = io.MultiWriter(os.Stdout)
	if util.GetConfig().Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
		c.Next()
	})

	r.Use(func(c *gin.Context) {
		c.Set("JSONResponse", func(code int, obj interface{}) {
			c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
			c.Writer.WriteHeader(code)
			encoder := json.NewEncoder(c.Writer)
			encoder.SetEscapeHTML(false)
			if err := encoder.Encode(obj); err != nil {
				c.String(http.StatusInternalServerError, err.Error())
			}
		})
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "UP",
			"message": "Service is running normally",
		})
	})

	r.Use(gin.Recovery())
	r.Use(apiPrefixMiddleware())
	r.Use(corsMiddleware())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			uc := &controller.UserController{}
			auth.POST("/register", uc.Register)
			auth.POST("/login", uc.Login)
		}

		adminAuth := api.Group("/admin/auth")
		{
			ac := &controller.AdminController{}
			adminAuth.POST("/login", ac.Login)
		}

		performance := api.Group("/performances")
		{
			pc := &controller.PerformanceController{}
			performance.GET("", pc.GetPerformanceList)
			performance.GET("/:id", pc.GetPerformanceByID)
			performance.GET("/categories", pc.GetCategories)
			performance.POST("/:id/cover", middleware.JWTAuthMiddleware(), pc.UploadCoverImage)
		}

		ticket := api.Group("/tickets")
		{
			tc := &controller.TicketController{}
			ticket.GET("/seckill", middleware.JWTAuthMiddleware(), tc.SeckillTicket)
		}
	}

	auth := r.Group("/api")
	auth.Use(middleware.JWTAuthMiddleware())
	{
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

		ticket := auth.Group("/tickets")
		{
			tc := &controller.TicketController{}
			ticket.POST("/seckill", tc.SeckillTicket)
		}

		ticketPerformance := auth.Group("/tickets")
		{
			tc := &controller.TicketController{}
			ticketPerformance.GET("/performance/:performanceId", tc.GetTicketTypesByPerformanceID)
		}
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminAuthMiddleware())
	{
		dashboard := admin.Group("/dashboard")
		{
			ac := &controller.AdminController{}
			dashboard.GET("/stats", ac.GetDashboardStats)
			dashboard.GET("/category-distribution", ac.GetCategoryDistribution)
		}

		adminMgmt := admin.Group("/admins")
		{
			ac := &controller.AdminController{}
			adminMgmt.GET("", ac.GetAdminList)
			adminMgmt.GET("/:id", ac.GetAdminInfo)
			adminMgmt.PUT("/:id", ac.UpdateAdmin)
			adminMgmt.POST("/change-password", ac.ChangePassword)
		}

		userMgmt := admin.Group("/users")
		{
			uc := &controller.AdminUserController{}
			userMgmt.GET("", uc.GetUserList)
			userMgmt.GET("/:id", uc.GetUserDetail)
			userMgmt.PUT("/:id/status", uc.UpdateUserStatus)
			userMgmt.DELETE("/:id", uc.DeleteUser)
		}

		orderMgmt := admin.Group("/orders")
		{
			oc := &controller.AdminOrderController{}
			orderMgmt.GET("", oc.GetOrderList)
			orderMgmt.GET("/:id", oc.GetOrderDetail)
			orderMgmt.POST("/:id/refund", oc.ProcessRefund)
			orderMgmt.GET("/export", oc.ExportOrders)
		}

		performanceMgmt := admin.Group("/performances")
		{
			pc := &controller.AdminPerformanceController{}
			performanceMgmt.GET("", pc.GetPerformanceList)
			performanceMgmt.GET("/:id", pc.GetPerformanceDetail)
			performanceMgmt.POST("", pc.CreatePerformance)
			performanceMgmt.PUT("/:id", pc.UpdatePerformance)
			performanceMgmt.DELETE("/:id", pc.DeletePerformance)
		}

		ticketTypeMgmt := admin.Group("/ticket-types")
		{
			ttc := &controller.AdminTicketTypeController{}
			ticketTypeMgmt.GET("", ttc.GetTicketTypeList)
			ticketTypeMgmt.POST("", ttc.CreateTicketType)
			ticketTypeMgmt.PUT("/:id", ttc.UpdateTicketType)
			ticketTypeMgmt.DELETE("/:id", ttc.DeleteTicketType)
			ticketTypeMgmt.POST("/:id/update-stock", ttc.UpdateTicketStock)
		}

		categoryMgmt := admin.Group("/categories")
		{
			cc := &controller.AdminCategoryController{}
			categoryMgmt.GET("", cc.GetCategoryList)
			categoryMgmt.POST("", cc.CreateCategory)
			categoryMgmt.PUT("/:id", cc.UpdateCategory)
			categoryMgmt.DELETE("/:id", cc.DeleteCategory)
		}

		systemMgmt := admin.Group("/system")
		{
			sc := &controller.AdminSystemController{}
			systemMgmt.GET("/config", sc.GetConfig)
			systemMgmt.PUT("/config", sc.UpdateConfig)
		}

		logs := admin.Group("/logs")
		{
			ac := &controller.AdminController{}
			logs.GET("", ac.GetAdminLogs)
		}
	}

	return r
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		cfg := util.GetConfig()

		allowed := false
		for _, allowedOrigin := range cfg.CORS.AllowedOrigins {
			if origin == strings.TrimSpace(allowedOrigin) {
				allowed = true
				break
			}
		}

		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Token, X-Token, X-CSRF-Token")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.JSON(http.StatusOK, gin.H{"message": "预检请求成功"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func ServeStaticFiles(r *gin.Engine) {
	cfg := util.GetConfig()
	uploadsDir := cfg.Upload.Path
	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		os.MkdirAll(uploadsDir, 0755)
	}

	r.StaticFS("/uploads", http.Dir(uploadsDir))
}

func apiPrefixMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if !strings.HasPrefix(path, "/api/") &&
			!strings.HasPrefix(path, "/favicon.ico") &&
			!strings.HasPrefix(path, "/swagger/") &&
			!strings.HasPrefix(path, "/uploads/") &&
			path != "/" &&
			path != "/health" {
			redirectPath := "/api" + path

			if c.Request.URL.RawQuery != "" {
				redirectPath += "?" + c.Request.URL.RawQuery
			}

			c.Status(http.StatusTemporaryRedirect)
			c.Header("Location", redirectPath)
			c.Abort()
			return
		}

		c.Next()
	}
}
