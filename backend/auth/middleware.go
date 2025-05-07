package auth

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// JWTMiddleware checks for a valid JWT token in the Authorization header
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get the Authorization header
		authHeader := c.Request().Header.Get("Authorization")
		
		// Check if the header is empty or doesn't start with "Bearer "
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing or invalid authorization token")
		}
		
		// Extract the token from the header
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		// Validate the token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
		}
		
		// Set user information in the context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		
		// Continue to the next handler
		return next(c)
	}
}

// AdminOnly middleware ensures that only users with admin role can access the route
func AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get the role from the context (set by JWTMiddleware)
		role, ok := c.Get("role").(string)
		if !ok || role != "admin" {
			return echo.NewHTTPError(http.StatusForbidden, "Admin access required")
		}
		
		// Continue to the next handler
		return next(c)
	}
} 