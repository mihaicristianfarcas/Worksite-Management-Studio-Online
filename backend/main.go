package main

import (
	"net/http"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/controller"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize database
	config.InitDB()

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

	// Controller instances
	workerCtrl := controller.NewWorkerController(workerRepo)
	projectCtrl := controller.NewProjectController(projectRepo)

	// Worker routes
	e.GET("/api/workers", workerCtrl.GetAllWorkers)
	e.GET("/api/workers/:id", workerCtrl.GetWorker)
	e.POST("/api/workers", workerCtrl.CreateWorker)
	e.PUT("/api/workers/:id", workerCtrl.UpdateWorker)
	e.DELETE("/api/workers/:id", workerCtrl.DeleteWorker)

	// Project routes
	e.GET("/api/projects", projectCtrl.GetAllProjects)
	e.GET("/api/projects/:id", projectCtrl.GetProject)
	e.POST("/api/projects", projectCtrl.CreateProject)
	e.PUT("/api/projects/:id", projectCtrl.UpdateProject)
	e.DELETE("/api/projects/:id", projectCtrl.DeleteProject)

	// Worker-Project relationship routes
	e.POST("/api/workers/:workerId/projects/:projectId", workerCtrl.AddToProject)
	e.DELETE("/api/workers/:workerId/projects/:projectId", workerCtrl.RemoveFromProject)

	// Start the server
	e.Logger.Fatal(e.Start(":8080"))
}