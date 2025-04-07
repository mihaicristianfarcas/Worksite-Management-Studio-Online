package controller

import (
	"net/http"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type Controller struct {
	repo     *repository.Repository
	validate *validator.Validate
}

func NewController(repo *repository.Repository) *Controller {
	validate := validator.New()
	return &Controller{
		repo:     repo,
		validate: validate,
	}
}

type FilterParams struct {
	Position  string `query:"position"`
	MinAge    int    `query:"minAge"`
	MaxAge    int    `query:"maxAge"`
	MinSalary int    `query:"min_salary"`
	MaxSalary int    `query:"max_salary"`
	Page      int    `query:"page"`
	PageSize  int    `query:"pageSize"`
}

type PaginatedResponse struct {
	Data     []model.Worker `json:"data"`
	Total    int           `json:"total"`
	Page     int           `json:"page"`
	PageSize int           `json:"pageSize"`
}

// Get all workers
// GET /workers
// Filter by position: ?position=Developer
// Filter by age: ?minAge=25&maxAge=30
// Filter by salary: ?min_salary=50000&max_salary=70000
// Pagination: ?page=1&pageSize=10
// Combine filters: ?position=Developer&minAge=25&sortBy=salary&page=1&pageSize=10

func (c *Controller) GetAllWorkers(ctx echo.Context) error {
	var params FilterParams
	if err := ctx.Bind(&params); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid filter parameters"})
	}

	// Set default values for pagination
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 {
		params.PageSize = 10
	}

	// Get filtered workers
	filteredWorkers, err := c.repo.GetFilteredWorkers(
		params.Position,
		params.MinAge,
		params.MaxAge,
		params.MinSalary,
		params.MaxSalary,
	)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Apply pagination
	total := len(filteredWorkers)
	start := (params.Page - 1) * params.PageSize
	end := start + params.PageSize
	if start >= total {
		start = 0
		end = 0
	} else if end > total {
		end = total
	}

	var paginatedWorkers []model.Worker
	if start < end {
		paginatedWorkers = filteredWorkers[start:end]
	}

	response := PaginatedResponse{
		Data:     paginatedWorkers,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}

	return ctx.JSON(http.StatusOK, response)
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
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request data")
	}

	// Validate worker data
	if err := c.validate.Struct(worker); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errorMessages := make([]string, len(validationErrors))
		for i, e := range validationErrors {
			errorMessages[i] = e.Field() + ": " + e.Tag()
		}
		return echo.NewHTTPError(http.StatusBadRequest, map[string]interface{}{
			"error": "Validation failed",
			"details": errorMessages,
		})
	}
	
	if err := c.repo.CreateWorker(worker); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	
	return ctx.JSON(http.StatusCreated, worker)
}

func (c *Controller) UpdateWorker(ctx echo.Context) error {
	id := ctx.Param("id")
	
	worker := model.Worker{}
	if err := ctx.Bind(&worker); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request data")
	}
	
	// Ensure ID in path matches body
	worker.ID = id

	// Validate worker data
	if err := c.validate.Struct(worker); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errorMessages := make([]string, len(validationErrors))
		for i, e := range validationErrors {
			errorMessages[i] = e.Field() + ": " + e.Tag()
		}
		return echo.NewHTTPError(http.StatusBadRequest, map[string]interface{}{
			"error": "Validation failed",
			"details": errorMessages,
		})
	}
	
	if err := c.repo.UpdateWorker(worker); err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	
	return ctx.JSON(http.StatusOK, worker)
}

func (c *Controller) DeleteWorker(ctx echo.Context) error {
	id := ctx.Param("id")
	
	if err := c.repo.DeleteWorker(id); err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}
	
	return ctx.JSON(http.StatusOK, map[string]string{"message": "Worker deleted successfully"})
}