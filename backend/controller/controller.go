package controller

import (
	"net/http"
	"sort"

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
	return &Controller{
		repo:     repo,
		validate: validator.New(),
	}
}

type FilterParams struct {
	Position string `query:"position"`
	MinAge   int    `query:"min_age"`
	MaxAge   int    `query:"max_age"`
	MinSalary int   `query:"min_salary"`
	MaxSalary int   `query:"max_salary"`
	SortBy   string `query:"sort_by"`
	SortOrder string `query:"sort_order"`
}

// Get all workers
// GET /workers
// Filter by position: ?position=Dulgher
// Filter by age: ?min_age=25&max_age=30
// Filter by salary: ?min_salary=50000&max_salary=70000
// Sort by field: ?sort_by=name&sort_order=asc
// Combine filters: ?position=Dulgher&min_age=25&sort_by=salary&sort_order=desc

func (c *Controller) GetAllWorkers(ctx echo.Context) error {
	var params FilterParams
	if err := ctx.Bind(&params); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid filter parameters"})
	}

	workers, err := c.repo.GetAllWorkers()
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Apply filters
	var filteredWorkers []model.Worker
	for _, worker := range workers {
		if params.Position != "" && worker.Position != params.Position {
			continue
		}
		if params.MinAge > 0 && worker.Age < params.MinAge {
			continue
		}
		if params.MaxAge > 0 && worker.Age > params.MaxAge {
			continue
		}
		if params.MinSalary > 0 && worker.Salary < params.MinSalary {
			continue
		}
		if params.MaxSalary > 0 && worker.Salary > params.MaxSalary {
			continue
		}
		filteredWorkers = append(filteredWorkers, worker)
	}

	// Apply sorting
	if params.SortBy != "" {
		sort.Slice(filteredWorkers, func(i, j int) bool {
			switch params.SortBy {
			case "name":
				if params.SortOrder == "desc" {
					return filteredWorkers[i].Name > filteredWorkers[j].Name
				}
				return filteredWorkers[i].Name < filteredWorkers[j].Name
			case "age":
				if params.SortOrder == "desc" {
					return filteredWorkers[i].Age > filteredWorkers[j].Age
				}
				return filteredWorkers[i].Age < filteredWorkers[j].Age
			case "salary":
				if params.SortOrder == "desc" {
					return filteredWorkers[i].Salary > filteredWorkers[j].Salary
				}
				return filteredWorkers[i].Salary < filteredWorkers[j].Salary
			default:
				return false
			}
		})
	}

	return ctx.JSON(http.StatusOK, filteredWorkers)
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

	// Validate worker data
	if err := c.validate.Struct(worker); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
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

	// Validate worker data
	if err := c.validate.Struct(worker); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	
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