package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "mihaicristianfarcas"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "worksite_management_individual_entities"),
		getEnv("DB_PORT", "5432"),
	)

	// Configure GORM logger
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,  // Threshold for slow queries
			LogLevel:                  logger.Error, // Log level (Error, Warn, Info)
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Open database connection with optimized configuration
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
		// Disable default transaction for better performance
		SkipDefaultTransaction: true,
		// Enable prepared statement cache
		PrepareStmt: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Set up connection pool
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database connection:", err)
	}
	
	// Set connection pool parameters
	sqlDB.SetMaxIdleConns(10)        // Maximum number of idle connections
	sqlDB.SetMaxOpenConns(100)       // Maximum number of open connections
	sqlDB.SetConnMaxLifetime(1 * time.Hour) // Maximum connection lifetime

	// Auto Migrate the schema with optimized indices
	err = db.AutoMigrate(&model.Worker{}, &model.Project{}, &model.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Create indexes for frequently queried fields
	createIndexes(db)

	DB = db
}

// createIndexes adds database indexes for query optimization
func createIndexes(db *gorm.DB) {
	// Add indexes to Worker table
	db.Exec("CREATE INDEX IF NOT EXISTS idx_workers_name ON workers(name)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_workers_position ON workers(position)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_workers_salary ON workers(salary)")
	
	// Add indexes to Project table
	db.Exec("CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date)")
	
	// Add composite index for geospatial queries
	db.Exec("CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(latitude, longitude)")
	
	// Add index for the many-to-many relationship
	db.Exec("CREATE INDEX IF NOT EXISTS idx_worker_projects_worker_id ON worker_projects(worker_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_worker_projects_project_id ON worker_projects(project_id)")
	
	// Add indexes for User table
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
	
	log.Println("Database indexes created successfully")
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
} 