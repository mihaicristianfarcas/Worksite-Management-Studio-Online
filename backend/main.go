package main

import (
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/auth"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/cache"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/controller"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/middleware"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/monitoring"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize the database
	config.InitDB()
	
	// Migrate models - ensure MonitoredUser is included
	config.DB.AutoMigrate(&model.MonitoredUser{})
	
	// Initialize the cache system
	cache.InitCache()

	// New Echo instance
	e := echo.New()

	// CORS middleware
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"}, // Your frontend URL
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
	}))

	// Repository instances
	workerRepo := repository.NewWorkerRepository()
	projectRepo := repository.NewProjectRepository()
	userRepo := repository.NewUserRepository()
	logRepo := repository.NewLogRepository()
	monitoredUserRepo := repository.NewMonitoredUserRepository()

	// Initialize monitoring service
	monitoringService := monitoring.NewMonitoringService(monitoredUserRepo, userRepo)

	// Controller instances
	workerCtrl := controller.NewWorkerController(workerRepo)
	projectCtrl := controller.NewProjectController(projectRepo)
	authCtrl := controller.NewAuthController(userRepo)
	adminCtrl := controller.NewAdminController(userRepo, logRepo)
	monitoringCtrl := controller.NewMonitoringController(
		monitoredUserRepo,
		userRepo,
		monitoringService.GetActivityMonitor(),
		monitoringService.GetWebSocketHub(),
	)

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

	// Monitoring routes (admin only)
	monitoring := e.Group("/api/monitoring", auth.JWTMiddleware, auth.AdminOnly)
	monitoring.GET("/users", monitoringCtrl.GetMonitoredUsers)
	monitoring.POST("/users", monitoringCtrl.ManuallyAddToMonitored)
	monitoring.PUT("/users/:id", monitoringCtrl.UpdateMonitoredUser)
	monitoring.DELETE("/users/:id", monitoringCtrl.RemoveFromMonitored)
	monitoring.GET("/alerts", monitoringCtrl.GetRecentAlerts)
	
	// WebSocket endpoint for real-time monitoring (admin only)
	e.GET("/ws/monitoring", monitoringCtrl.HandleWebSocket, auth.JWTMiddleware, auth.AdminOnly)

	// Set up graceful shutdown
	go func() {
		// Create channel for shutdown signals
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		
		// Wait for shutdown signal
		<-quit
		
		// Shutdown monitoring service
		monitoringService.Shutdown()
		
		// Shutdown server
		e.Shutdown(nil)
	}()

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}