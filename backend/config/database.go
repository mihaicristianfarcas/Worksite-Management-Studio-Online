package config

import (
	"fmt"
	"log"
	"os"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "mihaicristianfarcas"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "worksite_management"),
		getEnv("DB_PORT", "5432"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate the schema
	err = db.AutoMigrate(&model.Worker{}, &model.Project{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
} 