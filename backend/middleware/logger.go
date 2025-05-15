package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
)

// ActivityLogger is a middleware that logs CRUD operations
type ActivityLogger struct {
	logRepo *repository.LogRepository
}

// NewActivityLogger creates a new ActivityLogger middleware
func NewActivityLogger(logRepo *repository.LogRepository) *ActivityLogger {
	return &ActivityLogger{
		logRepo: logRepo,
	}
}

// LogCRUDOperation logs important operations (create, update, delete) for specified resources
func (l *ActivityLogger) LogCRUDOperation(entityType model.EntityType) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Process the request
			err := next(c)
			if err != nil {
				return err
			}

			// Don't log OPTIONS requests
			if c.Request().Method == http.MethodOptions {
				return nil
			}
			
			// Skip GET requests to reduce log volume
			if c.Request().Method == http.MethodGet {
				return nil
			}

			// Get user information from context (set by JWTMiddleware)
			userID, ok := c.Get("user_id").(uint)
			if !ok {
				// If user_id is not in context, this might be a public endpoint
				// or the authentication failed, so we won't log it
				return nil
			}

			username, _ := c.Get("username").(string)
			
			// Determine log type based on HTTP method
			var logType model.LogType
			switch c.Request().Method {
			case http.MethodPost:
				logType = model.LogTypeCreate
			case http.MethodPut, http.MethodPatch:
				logType = model.LogTypeUpdate
			case http.MethodDelete:
				logType = model.LogTypeDelete
			default:
				return nil
			}

			// Get entity ID from URL path parameter
			entityID := uint(0)
			idParam := c.Param("id")
			if idParam != "" {
				id, err := strconv.ParseUint(idParam, 10, 32)
				if err == nil {
					entityID = uint(id)
				}
			}

			// Create description based on the operation
			description := fmt.Sprintf("%s %s", logType, entityType)
			if entityID > 0 {
				description = fmt.Sprintf("%s with ID: %d", description, entityID)
			}

			// Create log entry
			log := &model.ActivityLog{
				UserID:      userID,
				Username:    username,
				LogType:     logType,
				EntityType:  entityType,
				EntityID:    entityID,
				Description: description,
			}

			// Store log asynchronously to avoid blocking the response
			go func(log *model.ActivityLog) {
				err := l.logRepo.CreateLog(log)
				if err != nil {
					// Just print to console for now, could use a more sophisticated
					// error handling mechanism in production
					fmt.Printf("Failed to log activity: %v\n", err)
				}
			}(log)

			return nil
		}
	}
}

// LogUserAuth logs user authentication events (login, logout, register)
func (l *ActivityLogger) LogUserAuth(logType model.LogType) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Process the request
			err := next(c)
			if err != nil {
				return err
			}
			
			// Check response status to see if the auth operation was successful
			// This assumes auth handlers set userID in response
			resMap, ok := c.Get("auth_response").(map[string]interface{})
			if !ok {
				// No auth response found, might be a failed auth attempt
				return nil
			}
			
			userID, ok := resMap["user_id"].(uint)
			if !ok {
				return nil
			}
			
			username, _ := resMap["username"].(string)
			
			// Create simplified log entry for auth event (removed IP and UserAgent)
			log := &model.ActivityLog{
				UserID:      userID,
				Username:    username,
				LogType:     logType,
				EntityType:  model.EntityTypeUser,
				Description: fmt.Sprintf("User %s: %s", logType, username),
			}
			
			// Store log asynchronously
			go func(log *model.ActivityLog) {
				err := l.logRepo.CreateLog(log)
				if err != nil {
					fmt.Printf("Failed to log auth activity: %v\n", err)
				}
			}(log)
			
			return nil
		}
	}
}

// ExtractEntityTypeFromPath determines the entity type from the URL path
func ExtractEntityTypeFromPath(path string) model.EntityType {
	path = strings.ToLower(path)
	
	switch {
	case strings.Contains(path, "/workers"):
		return model.EntityTypeWorker
	case strings.Contains(path, "/projects"):
		return model.EntityTypeProject
	case strings.Contains(path, "/users"):
		return model.EntityTypeUser
	default:
		return ""
	}
} 