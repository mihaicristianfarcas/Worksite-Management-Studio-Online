package model

import (
	"time"

	"gorm.io/gorm"
)

type Worker struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" validate:"required,min=2,max=50"`
	Age       int            `json:"age" validate:"required,min=18,max=100"`
	Position  string         `json:"position" validate:"required,min=2,max=50"`
	Salary    int            `json:"salary" validate:"required,min=0"`
	UserID    uint           `json:"user_id" gorm:"index" validate:"required"`
	Projects  []Project      `json:"projects" gorm:"many2many:worker_projects;"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `json:"deleted_at" gorm:"index"`
}