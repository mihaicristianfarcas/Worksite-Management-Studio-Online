package repository

import (
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/gorm"
)

// LogRepository handles database operations for activity logs
type LogRepository struct {
	db *gorm.DB
}

// NewLogRepository creates a new LogRepository instance
func NewLogRepository() *LogRepository {
	return &LogRepository{
		db: config.DB,
	}
}

// CreateLog creates a new activity log entry
func (r *LogRepository) CreateLog(log *model.ActivityLog) error {
	return r.db.Create(log).Error
}

// GetLogsByUser retrieves all logs for a specific user
func (r *LogRepository) GetLogsByUser(userID uint, page, pageSize int) ([]model.ActivityLog, int64, error) {
	var logs []model.ActivityLog
	var total int64

	// Count total records
	if err := r.db.Model(&model.ActivityLog{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// GetLogsByEntityType retrieves logs filtered by entity type
func (r *LogRepository) GetLogsByEntityType(entityType model.EntityType, page, pageSize int) ([]model.ActivityLog, int64, error) {
	var logs []model.ActivityLog
	var total int64

	// Count total records
	if err := r.db.Model(&model.ActivityLog{}).
		Where("entity_type = ?", entityType).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Where("entity_type = ?", entityType).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// GetLogsByLogType retrieves logs filtered by log type
func (r *LogRepository) GetLogsByLogType(logType model.LogType, page, pageSize int) ([]model.ActivityLog, int64, error) {
	var logs []model.ActivityLog
	var total int64

	// Count total records
	if err := r.db.Model(&model.ActivityLog{}).
		Where("log_type = ?", logType).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Where("log_type = ?", logType).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// GetRecentLogs retrieves recent logs with pagination
func (r *LogRepository) GetRecentLogs(page, pageSize int) ([]model.ActivityLog, int64, error) {
	var logs []model.ActivityLog
	var total int64

	// Count total records
	if err := r.db.Model(&model.ActivityLog{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

// GetLogsByDateRange retrieves logs within a specified date range
func (r *LogRepository) GetLogsByDateRange(startDate, endDate string, page, pageSize int) ([]model.ActivityLog, int64, error) {
	var logs []model.ActivityLog
	var total int64

	// Count total records
	if err := r.db.Model(&model.ActivityLog{}).
		Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&logs).Error; err != nil {
		return nil, 0, err
	}

	return logs, total, nil
} 