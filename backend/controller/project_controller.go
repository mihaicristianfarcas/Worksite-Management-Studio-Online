package controller

import (
	"net/http"
	"strconv"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type ProjectController struct {
	repo *repository.ProjectRepository
	validate *validator.Validate
}

func NewProjectController(repo *repository.ProjectRepository) *ProjectController {
	return &ProjectController{
		repo: repo,
		validate: validator.New(),
	}
}

// GetAllProjects handles GET /api/projects
func (c *ProjectController) GetAllProjects(ctx echo.Context) error {
	// Get query parameters for filtering and sorting
	filters := make(map[string]interface{})
	if name := ctx.QueryParam("name"); name != "" {
		filters["name"] = name
	}
	if status := ctx.QueryParam("status"); status != "" {
		filters["status"] = status
	}
	if search := ctx.QueryParam("search"); search != "" {
		filters["search"] = search
	}

	sortBy := ctx.QueryParam("sort_by")
	sortOrder := ctx.QueryParam("sort_order")

	projects, err := c.repo.GetAll(filters, sortBy, sortOrder)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, projects)
}

// GetProject handles GET /api/projects/:id
func (c *ProjectController) GetProject(ctx echo.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	project, err := c.repo.GetByID(uint(id))
	if err != nil {
		return ctx.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	return ctx.JSON(http.StatusOK, project)
}

// CreateProject handles POST /api/projects
func (c *ProjectController) CreateProject(ctx echo.Context) error {
	var project model.Project
	if err := ctx.Bind(&project); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Validate project
	if err := c.validate.Struct(project); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	if err := c.repo.Create(&project); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusCreated, project)
}

// UpdateProject handles PUT /api/projects/:id
func (c *ProjectController) UpdateProject(ctx echo.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	var project model.Project
	if err := ctx.Bind(&project); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	project.ID = uint(id)
	if err := c.repo.Update(&project); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.JSON(http.StatusOK, project)
}

// DeleteProject handles DELETE /api/projects/:id
func (c *ProjectController) DeleteProject(ctx echo.Context) error {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	if err := c.repo.Delete(uint(id)); err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return ctx.NoContent(http.StatusNoContent)
} 