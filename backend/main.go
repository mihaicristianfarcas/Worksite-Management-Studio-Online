package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// Simple API endpoint
	e.GET("/api/hello", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "Hello from Echo!"})
	})

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}

// CORS ??
// package main

// import (
// 	"net/http"

// 	"github.com/labstack/echo/v4"
// 	"github.com/labstack/echo/v4/middleware"
// )

// func main() {
// 	e := echo.New()

// 	// Enable CORS with default settings (allows all origins)
// 	e.Use(middleware.CORS())

// 	// Custom CORS configuration (recommended for security)
// 	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
// 		AllowOrigins: []string{"http://localhost:5173"}, // Allow frontend domain
// 		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
// 		AllowHeaders: []string{"Content-Type", "Authorization"},
// 	}))

// 	// Example API endpoint
// 	e.GET("/api/hello", func(c echo.Context) error {
// 		return c.JSON(http.StatusOK, map[string]string{"message": "Hello from Echo!"})
// 	})

// 	// Start server
// 	e.Logger.Fatal(e.Start(":8080"))
// }
