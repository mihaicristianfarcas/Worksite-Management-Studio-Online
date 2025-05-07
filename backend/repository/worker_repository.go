package repository

import (
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/gorm"
)

type WorkerRepository struct {
	db *gorm.DB
}

func NewWorkerRepository() *WorkerRepository {
	return &WorkerRepository{
		db: config.DB,
	}
}

// Create creates a new worker
func (r *WorkerRepository) Create(worker *model.Worker) error {
	return r.db.Create(worker).Error
}

// GetByID retrieves a worker by ID
func (r *WorkerRepository) GetByID(id uint) (*model.Worker, error) {
	var worker model.Worker
	err := r.db.Preload("Projects").First(&worker, id).Error
	if err != nil {
		return nil, err
	}
	return &worker, nil
}

// GetAll retrieves all workers with optional filtering and sorting
func (r *WorkerRepository) GetAll(filters map[string]interface{}, sortBy string, sortOrder string, page int, pageSize int) ([]model.Worker, int64, error) {
	var workers []model.Worker
	var total int64
	query := r.db.Model(&model.Worker{})

	// Apply filters
	for key, value := range filters {
		switch key {
		case "search":
			searchTerm := value.(string)
			query = query.Where("name LIKE ? OR position LIKE ?", "%"+searchTerm+"%", "%"+searchTerm+"%")
		case "position":
			query = query.Where("position = ?", value)
		case "min_age":
			query = query.Where("age >= ?", value)
		case "max_age":
			query = query.Where("age <= ?", value)
		case "min_salary":
			query = query.Where("salary >= ?", value)
		case "max_salary":
			query = query.Where("salary <= ?", value)
		default:
			query = query.Where(key+" = ?", value)
		}
	}

	// Count total records (before pagination)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	if sortBy != "" {
		order := sortBy
		if sortOrder == "desc" {
			order += " DESC"
		}
		query = query.Order(order)
	}

	// Apply pagination
	if page > 0 && pageSize > 0 {
		offset := (page - 1) * pageSize
		query = query.Offset(offset).Limit(pageSize)
	}

	err := query.Preload("Projects").Find(&workers).Error
	return workers, total, err
}

// Update updates a worker
func (r *WorkerRepository) Update(worker *model.Worker) error {
	return r.db.Save(worker).Error
}

// Delete deletes a worker
func (r *WorkerRepository) Delete(id uint) error {
	return r.db.Delete(&model.Worker{}, id).Error
}

// AddToProject adds a worker to a project
func (r *WorkerRepository) AddToProject(workerID, projectID uint) error {
	return r.db.Model(&model.Worker{ID: workerID}).Association("Projects").Append(&model.Project{ID: projectID})
}

// RemoveFromProject removes a worker from a project
func (r *WorkerRepository) RemoveFromProject(workerID, projectID uint) error {
	return r.db.Model(&model.Worker{ID: workerID}).Association("Projects").Delete(&model.Project{ID: projectID})
} 