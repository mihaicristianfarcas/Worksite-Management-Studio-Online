package model

import (
	"time"

	"gorm.io/gorm"
)

// User represents a system user with authentication and role information
type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"uniqueIndex;size:50" validate:"required,min=3,max=50"`
	Email        string         `json:"email" gorm:"uniqueIndex;size:100" validate:"required,email"`
	PasswordHash string         `json:"-" gorm:"size:255" validate:"required"` // Not exposed in JSON
	Role         string         `json:"role" gorm:"default:user" validate:"required,oneof=user admin"`
	Active       bool           `json:"active" gorm:"default:true"`
	LastLogin    *time.Time     `json:"last_login"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at" gorm:"index"`
} 