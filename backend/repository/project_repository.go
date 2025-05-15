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
	// Use preload with a custom join query to check both worker's user_id and join table's user_id
	err := r.db.Preload("Workers", func(db *gorm.DB) *gorm.DB {
		return db.Joins("JOIN worker_projects ON worker_projects.worker_id = workers.id").
			Where("workers.user_id = ? AND worker_projects.user_id = ?", userID, userID)
	}).Where("id = ? AND user_id = ?", id, userID).First(&project).Error
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

	// Add user_id condition to the preloaded Workers to ensure we only get workers belonging to the current user
	// Also ensure the worker_projects join table has the correct user_id
	err := query.Preload("Workers", func(db *gorm.DB) *gorm.DB {
		return db.Joins("JOIN worker_projects ON worker_projects.worker_id = workers.id").
			Where("workers.user_id = ? AND worker_projects.user_id = ?", userID, userID)
	}).Find(&projects).Error
	
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

	// Create a transaction to handle the update
	tx := r.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Defer a function to handle transaction completion
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// First, update the project attributes without touching associations
	if err := tx.Model(project).Omit("Workers").Updates(project).Error; err != nil {
		tx.Rollback()
		return err
	}

	// If there are workers to update, handle that separately
	// This approach avoids the automatic M2M association handling that would cause the null user_id issue
	if len(project.Workers) > 0 {
		// Clear existing associations
		if err := tx.Where("project_id = ?", project.ID).Delete(&model.WorkerProject{}).Error; err != nil {
			tx.Rollback()
			return err
		}

		// Re-add worker associations with the correct user_id
		for _, worker := range project.Workers {
			workerProject := &model.WorkerProject{
				WorkerID:  worker.ID,
				ProjectID: project.ID,
				UserID:    userID,
			}
			if err := tx.Create(workerProject).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}
	
	return tx.Commit().Error
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
	
	// Create the join record with user_id
	workerProject := &model.WorkerProject{
		WorkerID:  workerID,
		ProjectID: projectID,
		UserID:    userID,
	}
	
	// Use the custom join table to create the relationship
	return r.db.Create(workerProject).Error
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
	
	// Delete the join record that has the appropriate worker_id, project_id AND user_id
	return r.db.Where("worker_id = ? AND project_id = ? AND user_id = ?", 
		workerID, projectID, userID).Delete(&model.WorkerProject{}).Error
} 