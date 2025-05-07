package main

import (
	"log"
	"os"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/data"
)

func main() {
	// Initialize the database connection
	config.InitDB()

	// Set up logging
	logFile, err := os.Create("populate_" + time.Now().Format("2006-01-02_15-04-05") + ".log")
	if err != nil {
		log.Fatal("Failed to create log file:", err)
	}
	defer logFile.Close()
	log.SetOutput(logFile)

	// Start data population
	log.Println("Starting database population process...")
	
	err = data.PopulateDatabase(config.DB)
	if err != nil {
		log.Fatalf("Database population failed: %v", err)
	}

	log.Println("Database population completed successfully!")
} 