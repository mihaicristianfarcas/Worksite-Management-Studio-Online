package model

// WorkerProject represents the many-to-many relationship between workers and projects
// with an additional user_id field to enforce data isolation between users
type WorkerProject struct {
	WorkerID  uint `gorm:"primaryKey"`
	ProjectID uint `gorm:"primaryKey"`
	UserID    uint `gorm:"index;not null"` // Used to enforce user isolation
}

// TableName overrides the default table name
func (WorkerProject) TableName() string {
	return "worker_projects"
} 