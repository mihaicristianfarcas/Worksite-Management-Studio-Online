package repository

import (
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{
		db: config.DB,
	}
}

// Create creates a new project
func (r *ProjectRepository) Create(project *model.Project) error {
	return r.db.Create(project).Error
}

// GetByID retrieves a project by ID
func (r *ProjectRepository) GetByID(id uint) (*model.Project, error) {
	var project model.Project
	err := r.db.Preload("Workers").First(&project, id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetAll retrieves all projects with optional filtering and sorting
func (r *ProjectRepository) GetAll(filters map[string]interface{}, sortBy string, sortOrder string, page int, pageSize int) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64
	query := r.db.Model(&model.Project{})

	// Apply filters
	for key, value := range filters {
		switch key {
		case "search":
			searchTerm := value.(string)
			query = query.Where(
				"name LIKE ? OR description LIKE ?",
				"%"+searchTerm+"%",
				"%"+searchTerm+"%",
			)
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

	err := query.Preload("Workers").Find(&projects).Error
	return projects, total, err
}

func (r *ProjectRepository) GetAllWorkers(page int, pageSize int) ([]model.Worker, int64, error) {
	var workers []model.Worker
	var total int64
	query := r.db.Model(&model.Worker{})

	// Count total records (before pagination)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	if page > 0 && pageSize > 0 {
		offset := (page - 1) * pageSize
		query = query.Offset(offset).Limit(pageSize)
	}

	err := query.Preload("Projects").Find(&workers).Error
	return workers, total, err
}

// Update updates a project
func (r *ProjectRepository) Update(project *model.Project) error {
	return r.db.Save(project).Error
}

// Delete deletes a project
func (r *ProjectRepository) Delete(id uint) error {
	return r.db.Delete(&model.Project{}, id).Error
}

// AddWorker adds a worker to a project
func (r *ProjectRepository) AddWorker(projectID, workerID uint) error {
	return r.db.Model(&model.Project{ID: projectID}).Association("Workers").Append(&model.Worker{ID: workerID})
}

// RemoveWorker removes a worker from a project
func (r *ProjectRepository) RemoveWorker(projectID, workerID uint) error {
	return r.db.Model(&model.Project{ID: projectID}).Association("Workers").Delete(&model.Worker{ID: workerID})
} 