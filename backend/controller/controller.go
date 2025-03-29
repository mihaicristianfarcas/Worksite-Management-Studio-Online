package controller

import (
	"net/http"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
)

type Controller struct {
	repo *repository.Repository
}

func NewController(repo *repository.Repository) *Controller {
	return &Controller{
		repo: repo,
	}
}

func (c *Controller) GetAllWorkers(ctx echo.Context) error {
	workers, err := c.repo.GetAllWorkers()
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	
	return ctx.JSON(http.StatusOK, workers)
}

func (c *Controller) GetWorker(ctx echo.Context) error {
	id := ctx.Param("id")
	
	worker, err := c.repo.GetWorker(id)
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	
	return ctx.JSON(http.StatusOK, worker)
}

func (c *Controller) CreateWorker(ctx echo.Context) error {
	worker := model.Worker{}
	
	if err := ctx.Bind(&worker); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}
	
	if err := c.repo.CreateWorker(worker); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	
	return ctx.JSON(http.StatusCreated, worker)
}

func (c *Controller) UpdateWorker(ctx echo.Context) error {
	id := ctx.Param("id")
	
	worker := model.Worker{}
	if err := ctx.Bind(&worker); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request data"})
	}
	
	// Ensure ID in path matches body
	worker.ID = id
	
	if err := c.repo.UpdateWorker(worker); err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	
	return ctx.JSON(http.StatusOK, worker)
}

func (c *Controller) DeleteWorker(ctx echo.Context) error {
	id := ctx.Param("id")
	
	if err := c.repo.DeleteWorker(id); err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	
	return ctx.JSON(http.StatusOK, map[string]string{"message": "Worker deleted successfully"})
}