package model

import (
	"time"

	"gorm.io/gorm"
)

// MonitoredUser represents a user being monitored for suspicious activity
type MonitoredUser struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	UserID         uint           `json:"user_id" gorm:"uniqueIndex" validate:"required"`
	Username       string         `json:"username" gorm:"size:50"`
	Reason         string         `json:"reason" gorm:"size:255"`
	Severity       string         `json:"severity" gorm:"size:20;default:medium"`
	AddedBy        uint           `json:"added_by"` // Admin user ID who added this user for monitoring
	AddedByName    string         `json:"added_by_name" gorm:"size:50"`
	FirstDetectedAt time.Time     `json:"first_detected_at"`
	LastAlertAt    time.Time      `json:"last_alert_at"`
	AlertCount     int            `json:"alert_count" gorm:"default:0"`
	Notes          string         `json:"notes" gorm:"size:1000"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at" gorm:"index"`
} 