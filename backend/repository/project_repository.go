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

// GetByID retrieves a project by ID and user ID
func (r *ProjectRepository) GetByID(id uint, userID uint) (*model.Project, error) {
	var project model.Project
	err := r.db.Preload("Workers", "user_id = ?", userID).Where("id = ? AND user_id = ?", id, userID).First(&project).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetAll retrieves all projects with optional filtering and sorting for a specific user
func (r *ProjectRepository) GetAll(userID uint, filters map[string]interface{}, sortBy string, sortOrder string, page int, pageSize int) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64
	query := r.db.Model(&model.Project{}).Where("user_id = ?", userID)

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

	err := query.Preload("Workers", "user_id = ?", userID).Find(&projects).Error
	return projects, total, err
}

// GetAllWorkers retrieves all workers for a specific user
func (r *ProjectRepository) GetAllWorkers(userID uint, page int, pageSize int) ([]model.Worker, int64, error) {
	var workers []model.Worker
	var total int64
	query := r.db.Model(&model.Worker{}).Where("user_id = ?", userID)

	// Count total records (before pagination)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	if page > 0 && pageSize > 0 {
		offset := (page - 1) * pageSize
		query = query.Offset(offset).Limit(pageSize)
	}

	err := query.Preload("Projects", "user_id = ?", userID).Find(&workers).Error
	return workers, total, err
}

// Update updates a project
func (r *ProjectRepository) Update(project *model.Project, userID uint) error {
	// First check if this project belongs to the user
	result := r.db.Where("id = ? AND user_id = ?", project.ID, userID).First(&model.Project{})
	if result.Error != nil {
		return result.Error
	}
	
	return r.db.Save(project).Error
}

// Delete deletes a project
func (r *ProjectRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Project{}).Error
}

// AddWorker adds a worker to a project (ensuring both belong to the user)
func (r *ProjectRepository) AddWorker(projectID, workerID, userID uint) error {
	// Verify project belongs to user
	project := &model.Project{}
	if err := r.db.Where("id = ? AND user_id = ?", projectID, userID).First(project).Error; err != nil {
		return err
	}
	
	// Verify worker belongs to user
	worker := &model.Worker{}
	if err := r.db.Where("id = ? AND user_id = ?", workerID, userID).First(worker).Error; err != nil {
		return err
	}
	
	return r.db.Model(project).Association("Workers").Append(worker)
}

// RemoveWorker removes a worker from a project (ensuring both belong to the user)
func (r *ProjectRepository) RemoveWorker(projectID, workerID, userID uint) error {
	// Verify project belongs to user
	project := &model.Project{}
	if err := r.db.Where("id = ? AND user_id = ?", projectID, userID).First(project).Error; err != nil {
		return err
	}
	
	// Verify worker belongs to user
	worker := &model.Worker{}
	if err := r.db.Where("id = ? AND user_id = ?", workerID, userID).First(worker).Error; err != nil {
		return err
	}
	
	return r.db.Model(project).Association("Workers").Delete(worker)
} 