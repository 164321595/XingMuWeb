package middleware

import (
	"net/http"
	"strings"

	"ticket-system-backend/util"

	"github.com/gin-gonic/gin"
)

func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "未提供认证令牌"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "令牌格式无效"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := util.ParseAdminToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "令牌已过期或无效"})
			c.Abort()
			return
		}

		c.Set("admin_id", claims.AdminID)
		c.Set("admin_username", claims.Username)
		c.Set("admin_role", claims.Role)

		c.Next()
	}
}

func AdminRoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("admin_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "无权限访问"})
			c.Abort()
			return
		}

		adminRole := role.(string)
		hasPermission := false

		for _, r := range roles {
			if adminRole == r || adminRole == "super_admin" {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "无权限访问此功能"})
			c.Abort()
			return
		}

		c.Next()
	}
}
