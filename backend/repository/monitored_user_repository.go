package repository

import (
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/gorm"
)

// MonitoredUserRepository handles database operations for monitored users
type MonitoredUserRepository struct {
	db *gorm.DB
}

// NewMonitoredUserRepository creates a new MonitoredUserRepository instance
func NewMonitoredUserRepository() *MonitoredUserRepository {
	return &MonitoredUserRepository{
		db: config.DB,
	}
}

// CreateMonitoredUser adds a user to the monitored list
func (r *MonitoredUserRepository) CreateMonitoredUser(monitoredUser *model.MonitoredUser) error {
	return r.db.Create(monitoredUser).Error
}

// GetMonitoredUserByUserID retrieves a monitored user by their user ID
func (r *MonitoredUserRepository) GetMonitoredUserByUserID(userID uint) (*model.MonitoredUser, error) {
	var monitoredUser model.MonitoredUser
	if err := r.db.Where("user_id = ?", userID).First(&monitoredUser).Error; err != nil {
		return nil, err
	}
	return &monitoredUser, nil
}

// GetAllMonitoredUsers retrieves all monitored users with pagination
func (r *MonitoredUserRepository) GetAllMonitoredUsers(page, pageSize int) ([]model.MonitoredUser, int64, error) {
	var monitoredUsers []model.MonitoredUser
	var total int64

	// Count total records
	if err := r.db.Model(&model.MonitoredUser{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get paginated records
	if err := r.db.
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&monitoredUsers).Error; err != nil {
		return nil, 0, err
	}

	return monitoredUsers, total, nil
}

// UpdateMonitoredUser updates a monitored user's information
func (r *MonitoredUserRepository) UpdateMonitoredUser(monitoredUser *model.MonitoredUser) error {
	return r.db.Save(monitoredUser).Error
}

// DeleteMonitoredUser removes a user from the monitored list
func (r *MonitoredUserRepository) DeleteMonitoredUser(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.MonitoredUser{}).Error
}

// RecordAlert updates the LastAlertAt and increments AlertCount for a monitored user
func (r *MonitoredUserRepository) RecordAlert(userID uint) error {
	var monitoredUser model.MonitoredUser
	
	// Try to find existing monitored user
	result := r.db.Where("user_id = ?", userID).First(&monitoredUser)
	
	if result.Error == nil {
		// User is already being monitored, update alert information
		return r.db.Model(&monitoredUser).
			Updates(map[string]interface{}{
				"last_alert_at": time.Now(),
				"alert_count":   gorm.Expr("alert_count + 1"),
			}).Error
	} else if result.Error == gorm.ErrRecordNotFound {
		// User not yet monitored, should be added via CreateMonitoredUser
		return nil
	} else {
		// Other errors
		return result.Error
	}
}

// GetHighAlertUsers retrieves users with high alert counts
func (r *MonitoredUserRepository) GetHighAlertUsers(threshold int) ([]model.MonitoredUser, error) {
	var monitoredUsers []model.MonitoredUser
	
	if err := r.db.
		Where("alert_count >= ?", threshold).
		Order("alert_count DESC").
		Find(&monitoredUsers).Error; err != nil {
		return nil, err
	}
	
	return monitoredUsers, nil
}

// GetRecentAlerts retrieves users with recent alerts
func (r *MonitoredUserRepository) GetRecentAlerts(hours int) ([]model.MonitoredUser, error) {
	var monitoredUsers []model.MonitoredUser
	
	cutoffTime := time.Now().Add(-time.Duration(hours) * time.Hour)
	
	if err := r.db.
		Where("last_alert_at >= ?", cutoffTime).
		Order("last_alert_at DESC").
		Find(&monitoredUsers).Error; err != nil {
		return nil, err
	}
	
	return monitoredUsers, nil
} 