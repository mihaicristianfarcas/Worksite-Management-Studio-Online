package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/auth"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/cache"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/controller"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/middleware"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize the database
	config.InitDB()
	
	// Initialize the cache system
	cache.InitCache()

	// New Echo instance
	e := echo.New()

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		e.Logger.Fatal("Error loading .env file")
	}

	// Get allowed origins from environment variable or use default
	allowedOrigins := []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		allowedOrigins = strings.Split(origins, ",")
	}

	// CORS middleware
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: allowedOrigins,
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
	}))

	// Repository instances
	workerRepo := repository.NewWorkerRepository()
	projectRepo := repository.NewProjectRepository()
	userRepo := repository.NewUserRepository()
	logRepo := repository.NewLogRepository() // Keep log repository for background logging

	// Controller instances
	workerCtrl := controller.NewWorkerController(workerRepo)
	projectCtrl := controller.NewProjectController(projectRepo)
	authCtrl := controller.NewAuthController(userRepo)
	adminCtrl := controller.NewAdminController(userRepo, logRepo)

	// Create activity logger middleware
	activityLogger := middleware.NewActivityLogger(logRepo)

	// Auth routes (public) with auth logging
	authGroup := e.Group("/api/auth")
	authGroup.POST("/login", authCtrl.Login, activityLogger.LogUserAuth(model.LogTypeLogin))
	authGroup.POST("/register", authCtrl.Register, activityLogger.LogUserAuth(model.LogTypeRegister))

	// Worker routes (protected) with CRUD logging
	workers := e.Group("/api/workers", auth.JWTMiddleware, activityLogger.LogCRUDOperation(model.EntityTypeWorker))
	workers.GET("", workerCtrl.GetAllWorkers)
	workers.GET("/:id", workerCtrl.GetWorker)
	workers.POST("", workerCtrl.CreateWorker)
	workers.PUT("/:id", workerCtrl.UpdateWorker)
	workers.DELETE("/:id", workerCtrl.DeleteWorker)

	// Project routes (protected) with CRUD logging
	projects := e.Group("/api/projects", auth.JWTMiddleware, activityLogger.LogCRUDOperation(model.EntityTypeProject))
	projects.GET("", projectCtrl.GetAllProjects)
	projects.GET("/:id", projectCtrl.GetProject)
	projects.POST("", projectCtrl.CreateProject)
	projects.PUT("/:id", projectCtrl.UpdateProject)
	projects.DELETE("/:id", projectCtrl.DeleteProject)

	// Project-Worker relationship routes (protected) with CRUD logging
	projects.POST("/:id/workers", projectCtrl.AssignWorkerToProject)
	projects.GET("/:id/workers/available", projectCtrl.GetAvailableWorkers)
	projects.DELETE("/:id/workers/:workerId", projectCtrl.UnassignWorkerFromProject)

	// Admin routes (protected with admin role) with CRUD logging
	admin := e.Group("/api/admin", auth.JWTMiddleware, auth.AdminOnly, activityLogger.LogCRUDOperation(model.EntityTypeUser))
	admin.GET("/users", adminCtrl.GetAllUsers)
	admin.PUT("/users/:id/status", adminCtrl.UpdateUserStatus)
	admin.PUT("/users/:id/role", adminCtrl.UpdateUserRole)
	admin.GET("/users/:id/activity", adminCtrl.GetUserActivity)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Check if TLS is enabled
	// tlsEnabled := os.Getenv("TLS_ENABLED") == "true"
	// certFile := os.Getenv("TLS_CERT_FILE")
	// keyFile := os.Getenv("TLS_KEY_FILE")

	// if tlsEnabled && certFile != "" && keyFile != "" {
	// 	e.Logger.Fatal(e.StartTLS(":"+port, certFile, keyFile))
	// } else {
	// 	e.Logger.Fatal(e.Start(":"+port))
	// }

	e.Logger.Fatal(e.Start(":"+port))

}