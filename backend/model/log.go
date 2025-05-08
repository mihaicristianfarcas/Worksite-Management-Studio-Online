package model

import (
	"time"

	"gorm.io/gorm"
)

// LogType represents the type of action being logged
type LogType string

const (
	// CRUD operation types
	LogTypeCreate LogType = "CREATE"
	LogTypeRead   LogType = "READ"
	LogTypeUpdate LogType = "UPDATE"
	LogTypeDelete LogType = "DELETE"
	
	// Auth operation types
	LogTypeLogin    LogType = "LOGIN"
	LogTypeLogout   LogType = "LOGOUT"
	LogTypeRegister LogType = "REGISTER"
)

// EntityType represents the type of entity being operated on
type EntityType string

const (
	EntityTypeWorker  EntityType = "WORKER"
	EntityTypeProject EntityType = "PROJECT"
	EntityTypeUser    EntityType = "USER"
)

// ActivityLog represents a system activity log entry
type ActivityLog struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"index" validate:"required"`
	Username    string         `json:"username" gorm:"size:50"`
	LogType     LogType        `json:"log_type" gorm:"size:20;index" validate:"required"`
	EntityType  EntityType     `json:"entity_type" gorm:"size:20;index" validate:"required"`
	EntityID    uint           `json:"entity_id" gorm:"index"`
	Description string         `json:"description" gorm:"size:255"`
	CreatedAt   time.Time      `json:"created_at" gorm:"index"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
} 