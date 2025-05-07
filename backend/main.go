package main

import (
	"net/http"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/auth"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/cache"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/controller"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize the database
	config.InitDB()
	
	// Initialize the cache system
	cache.InitCache()

	// New Echo instance
	e := echo.New()

	// CORS middleware
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173"}, // Your frontend URL
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{"Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
	}))

	// Repository instances
	workerRepo := repository.NewWorkerRepository()
	projectRepo := repository.NewProjectRepository()
	userRepo := repository.NewUserRepository()

	// Controller instances
	workerCtrl := controller.NewWorkerController(workerRepo)
	projectCtrl := controller.NewProjectController(projectRepo)
	authCtrl := controller.NewAuthController(userRepo)

	// Auth routes (public)
	e.POST("/api/auth/login", authCtrl.Login)
	e.POST("/api/auth/register", authCtrl.Register)

	// Worker routes (protected)
	workers := e.Group("/api/workers", auth.JWTMiddleware)
	workers.GET("", workerCtrl.GetAllWorkers)
	workers.GET("/:id", workerCtrl.GetWorker)
	workers.POST("", workerCtrl.CreateWorker)
	workers.PUT("/:id", workerCtrl.UpdateWorker)
	workers.DELETE("/:id", workerCtrl.DeleteWorker)

	// Project routes (protected)
	projects := e.Group("/api/projects", auth.JWTMiddleware)
	projects.GET("", projectCtrl.GetAllProjects)
	projects.GET("/:id", projectCtrl.GetProject)
	projects.POST("", projectCtrl.CreateProject)
	projects.PUT("/:id", projectCtrl.UpdateProject)
	projects.DELETE("/:id", projectCtrl.DeleteProject)

	// Project-Worker relationship routes (protected)
	projects.POST("/:id/workers", projectCtrl.AssignWorkerToProject)
	projects.GET("/:id/workers/available", projectCtrl.GetAvailableWorkers)
	projects.DELETE("/:id/workers/:workerId", projectCtrl.UnassignWorkerFromProject)

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}