package model

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" validate:"required,min=2,max=100"`
	Description string         `json:"description" validate:"required,min=10,max=500"`
	Status      string         `json:"status" validate:"required,oneof=active completed on_hold cancelled"`
	StartDate   time.Time      `json:"start_date" validate:"required"`
	EndDate     *time.Time     `json:"end_date"`
	Latitude    float64        `json:"latitude" validate:"required,latitude"`
	Longitude   float64        `json:"longitude" validate:"required,longitude"`
	Workers     []Worker       `json:"workers" gorm:"many2many:worker_projects;"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`
} 