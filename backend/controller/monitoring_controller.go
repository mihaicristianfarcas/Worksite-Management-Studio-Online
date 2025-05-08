package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/monitoring"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
)

// MonitoringController defines the interface for monitoring controller
type MonitoringController interface {
	GetMonitoredUsers(c echo.Context) error
	ManuallyAddToMonitored(c echo.Context) error
	RemoveFromMonitored(c echo.Context) error
	UpdateMonitoredUser(c echo.Context) error
	GetRecentAlerts(c echo.Context) error
	HandleWebSocket(c echo.Context) error
}

type monitoringController struct {
	monitoredUserRepo *repository.MonitoredUserRepository
	userRepo          repository.UserRepository
	activityMonitor   *monitoring.ActivityMonitor
	webSocketHub      *monitoring.WebSocketHub
}

// NewMonitoringController creates a new instance of MonitoringController
func NewMonitoringController(
	monitoredUserRepo *repository.MonitoredUserRepository,
	userRepo repository.UserRepository,
	activityMonitor *monitoring.ActivityMonitor,
	webSocketHub *monitoring.WebSocketHub,
) MonitoringController {
	return &monitoringController{
		monitoredUserRepo: monitoredUserRepo,
		userRepo:          userRepo,
		activityMonitor:   activityMonitor,
		webSocketHub:      webSocketHub,
	}
}

// GetMonitoredUsers retrieves all monitored users with pagination
func (c *monitoringController) GetMonitoredUsers(ctx echo.Context) error {
	// Extract query parameters for pagination
	page, _ := strconv.Atoi(ctx.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	
	pageSize, _ := strconv.Atoi(ctx.QueryParam("pageSize"))
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20 // Default page size
	}
	
	// Get monitored users from repository
	monitoredUsers, total, err := c.monitoredUserRepo.GetAllMonitoredUsers(page, pageSize)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch monitored users")
	}
	
	// Return paginated response
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"data":     monitoredUsers,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

// ManuallyAddToMonitored adds a user to the monitored list manually
func (c *monitoringController) ManuallyAddToMonitored(ctx echo.Context) error {
	// Parse request body
	var req struct {
		UserID  uint   `json:"user_id" validate:"required"`
		Reason  string `json:"reason" validate:"required"`
		Notes   string `json:"notes"`
		Severity string `json:"severity" validate:"omitempty,oneof=low medium high"`
	}
	
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Check if user exists
	user, err := c.userRepo.GetUserByID(req.UserID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}
	
	// Get admin info from context
	adminID, _ := ctx.Get("user_id").(uint)
	adminUsername, _ := ctx.Get("username").(string)
	
	// Check if user is already monitored
	_, err = c.monitoredUserRepo.GetMonitoredUserByUserID(req.UserID)
	if err == nil {
		return echo.NewHTTPError(http.StatusConflict, "User is already being monitored")
	}
	
	// Create monitored user entry
	monitoredUser := &model.MonitoredUser{
		UserID:           req.UserID,
		Username:         user.Username,
		Reason:           req.Reason,
		Severity:         req.Severity,
		AddedBy:          adminID,
		AddedByName:      adminUsername,
		FirstDetectedAt:  time.Now(),
		LastAlertAt:      time.Now(),
		AlertCount:       1,
		Notes:            req.Notes,
	}
	
	if err := c.monitoredUserRepo.CreateMonitoredUser(monitoredUser); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to add user to monitored list")
	}
	
	// Add to activity monitor
	c.activityMonitor.AddToMonitored(req.UserID)
	
	return ctx.JSON(http.StatusCreated, monitoredUser)
}

// RemoveFromMonitored removes a user from the monitored list
func (c *monitoringController) RemoveFromMonitored(ctx echo.Context) error {
	// Get user ID from path parameter
	userID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}
	
	// Delete from repository
	if err := c.monitoredUserRepo.DeleteMonitoredUser(uint(userID)); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to remove user from monitored list")
	}
	
	// Remove from activity monitor
	c.activityMonitor.RemoveFromMonitored(uint(userID))
	
	return ctx.JSON(http.StatusOK, map[string]interface{}{
		"message": "User removed from monitored list",
	})
}

// UpdateMonitoredUser updates monitoring information for a user
func (c *monitoringController) UpdateMonitoredUser(ctx echo.Context) error {
	// Get user ID from path parameter
	userID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid user ID")
	}
	
	// Parse request body
	var req struct {
		Notes    string `json:"notes"`
		Severity string `json:"severity" validate:"omitempty,oneof=low medium high"`
	}
	
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Get existing monitored user
	monitoredUser, err := c.monitoredUserRepo.GetMonitoredUserByUserID(uint(userID))
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Monitored user not found")
	}
	
	// Update fields that were provided
	if req.Notes != "" {
		monitoredUser.Notes = req.Notes
	}
	
	if req.Severity != "" {
		monitoredUser.Severity = req.Severity
	}
	
	// Save changes
	if err := c.monitoredUserRepo.UpdateMonitoredUser(monitoredUser); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update monitored user")
	}
	
	return ctx.JSON(http.StatusOK, monitoredUser)
}

// GetRecentAlerts retrieves recent alerts for monitored users
func (c *monitoringController) GetRecentAlerts(ctx echo.Context) error {
	// Parse hours parameter
	hoursStr := ctx.QueryParam("hours")
	hours, err := strconv.Atoi(hoursStr)
	if err != nil || hours <= 0 {
		hours = 24 // Default to last 24 hours
	}
	
	// Get recent alerts
	alerts, err := c.monitoredUserRepo.GetRecentAlerts(hours)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch recent alerts")
	}
	
	return ctx.JSON(http.StatusOK, alerts)
}

// HandleWebSocket handles WebSocket connection for real-time alerts
func (c *monitoringController) HandleWebSocket(ctx echo.Context) error {
	c.webSocketHub.HandleWebSocketConnection(ctx.Response(), ctx.Request())
	return nil
} 