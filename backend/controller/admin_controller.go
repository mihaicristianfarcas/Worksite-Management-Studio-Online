package controller

import (
	"net/http"
	"strconv"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
)

type AdminController interface {
	GetAllUsers(c echo.Context) error
	UpdateUserStatus(c echo.Context) error
	UpdateUserRole(c echo.Context) error
	GetUserActivity(c echo.Context) error
}

type adminController struct {
	userRepo repository.UserRepository
}

func NewAdminController(userRepo repository.UserRepository) AdminController {
	return &adminController{
		userRepo: userRepo,
	}
}

// GetAllUsers returns a list of all users
func (c *adminController) GetAllUsers(ctx echo.Context) error {
	// Extract query parameters for pagination
	page, _ := strconv.Atoi(ctx.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	
	pageSize, _ := strconv.Atoi(ctx.QueryParam("pageSize"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20 // Default page size
	}
	
	// Extract query parameter for search
	search := ctx.QueryParam("search")
	
	// Get users from repository
	users, total, err := c.userRepo.GetAllUsers(page, pageSize, search)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch users")
	}
	
	// Return paginated response
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"data":     users,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// UpdateUserStatus activates or deactivates a user
func (c *adminController) UpdateUserStatus(ctx echo.Context) error {
	// Get user ID from path parameter
	userID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}
	
	// Parse request body
	var req struct {
		Active bool `json:"active"`
	}
	
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Update user status
	if err := c.userRepo.UpdateUserStatus(uint(userID), req.Active); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user status")
	}
	
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"message": "User status updated successfully",
	})
}

// UpdateUserRole changes a user's role
func (c *adminController) UpdateUserRole(ctx echo.Context) error {
	// Get user ID from path parameter
	userID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}
	
	// Parse request body
	var req struct {
		Role string `json:"role" validate:"required,oneof=user admin"`
	}
	
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Check if role is valid
	if req.Role != "user" && req.Role != "admin" {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid role. Must be 'user' or 'admin'")
	}
	
	// Update user role
	if err := c.userRepo.UpdateUserRole(uint(userID), req.Role); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user role")
	}
	
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"message": "User role updated successfully",
	})
}

// GetUserActivity returns a user's recent activity (placeholder for now, will be expanded with logging)
func (c *adminController) GetUserActivity(ctx echo.Context) error {
	// Get user ID from path parameter
	userID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}
	
	// Get user to verify existence
	user, err := c.userRepo.GetUserByID(uint(userID))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}
	
	// Return basic user info for now (will be expanded with actual activity logs)
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"user": map[string]interface{}{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"role":       user.Role,
			"active":     user.Active,
			"last_login": user.LastLogin,
			"created_at": user.CreatedAt,
		},
		"activity": []interface{}{}, // Empty for now, will be populated with actual logs
	})
} 