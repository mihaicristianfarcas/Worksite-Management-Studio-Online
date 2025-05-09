package auth

import (
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// JWTMiddleware checks for a valid JWT token in the Authorization header or query parameter
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		var tokenString string
		
		// First check the Authorization header
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			if len(tokenString) > 10 {
				log.Printf("Token found in Authorization header: %s...", tokenString[:10])
			} else {
				log.Printf("Token found in Authorization header (short token)")
			}
		}
		
		// If no token in header, check query parameter (for WebSocket connections)
		if tokenString == "" {
			tokenString = c.QueryParam("token")
			if tokenString != "" {
				if len(tokenString) > 10 {
					log.Printf("Token found in query parameter: %s...", tokenString[:10])
				} else {
					log.Printf("Token found in query parameter (short token)")
				}
			}
		}
		
		// Return error if no token found in either location
		if tokenString == "" {
			log.Printf("No token found in request from %s", c.Request().RemoteAddr)
			return echo.NewHTTPError(http.StatusUnauthorized, "Missing authorization token")
		}
		
		// Validate the token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			log.Printf("Token validation failed: %v", err)
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
		}
		
		log.Printf("Token validated successfully for user: %s (ID: %d, Role: %s)", 
			claims.Username, claims.UserID, claims.Role)
		
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