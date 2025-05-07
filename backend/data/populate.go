package data

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"gorm.io/gorm"
)

const (
	NumWorkers      = 100000 // Number of workers to generate
	NumProjects     = 100000 // Number of projects to generate
	BatchSize       = 1000   // Size of each batch insertion
	MaxAssignments  = 5      // Maximum number of projects per worker
)

// PopulateDatabase generates and inserts fake data into the database
func PopulateDatabase(db *gorm.DB) error {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	log.Println("Starting database population...")
	startTime := time.Now()

	// Generate and insert workers in batches
	log.Println("Generating workers...")
	if err := generateWorkers(db); err != nil {
		return fmt.Errorf("failed to generate workers: %v", err)
	}

	// Generate and insert projects in batches
	log.Println("Generating projects...")
	if err := generateProjects(db); err != nil {
		return fmt.Errorf("failed to generate projects: %v", err)
	}

	// Create worker-project assignments
	log.Println("Creating worker-project assignments...")
	if err := createAssignments(db); err != nil {
		return fmt.Errorf("failed to create assignments: %v", err)
	}

	// Verify data integrity
	log.Println("Verifying data integrity...")
	if err := verifyDataIntegrity(db); err != nil {
		return fmt.Errorf("data integrity verification failed: %v", err)
	}

	elapsed := time.Since(startTime)
	log.Printf("Database population completed in %s", elapsed)
	return nil
}

// generateWorkers creates and inserts workers in batches
func generateWorkers(db *gorm.DB) error {
	for i := 0; i < NumWorkers; i += BatchSize {
		batch := make([]model.Worker, 0, BatchSize)
		
		// Generate a batch of workers
		batchSize := min(BatchSize, NumWorkers-i)
		for j := 0; j < batchSize; j++ {
			batch = append(batch, GenerateFakeWorker())
		}
		
		// Batch insert workers
		result := db.CreateInBatches(batch, BatchSize)
		if result.Error != nil {
			return result.Error
		}
		
		log.Printf("Inserted %d workers (total: %d/%d)", batchSize, i+batchSize, NumWorkers)
	}
	return nil
}

// generateProjects creates and inserts projects in batches
func generateProjects(db *gorm.DB) error {
	for i := 0; i < NumProjects; i += BatchSize {
		batch := make([]model.Project, 0, BatchSize)
		
		// Generate a batch of projects
		batchSize := min(BatchSize, NumProjects-i)
		for j := 0; j < batchSize; j++ {
			batch = append(batch, GenerateFakeProject())
		}
		
		// Batch insert projects
		result := db.CreateInBatches(batch, BatchSize)
		if result.Error != nil {
			return result.Error
		}
		
		log.Printf("Inserted %d projects (total: %d/%d)", batchSize, i+batchSize, NumProjects)
	}
	return nil
}

// createAssignments creates worker-project assignments
func createAssignments(db *gorm.DB) error {
	// Get all worker and project IDs
	var workerIDs []uint
	var projectIDs []uint
	
	if err := db.Model(&model.Worker{}).Pluck("id", &workerIDs).Error; err != nil {
		return err
	}
	
	if err := db.Model(&model.Project{}).Pluck("id", &projectIDs).Error; err != nil {
		return err
	}

	// For each worker, assign 1-5 random projects
	for i, workerID := range workerIDs {
		// Get worker
		var worker model.Worker
		if err := db.First(&worker, workerID).Error; err != nil {
			return err
		}
		
		// Assign random number of projects (1-5)
		numAssignments := rand.Intn(MaxAssignments) + 1
		assignedProjects := make([]model.Project, 0, numAssignments)
		
		// Select random projects
		for j := 0; j < numAssignments; j++ {
			projectID := projectIDs[rand.Intn(len(projectIDs))]
			
			var project model.Project
			if err := db.First(&project, projectID).Error; err != nil {
				return err
			}
			
			assignedProjects = append(assignedProjects, project)
		}
		
		// Associate projects with worker
		if err := db.Model(&worker).Association("Projects").Append(assignedProjects); err != nil {
			return err
		}
		
		if (i+1) % 1000 == 0 {
			log.Printf("Created assignments for %d/%d workers", i+1, len(workerIDs))
		}
	}
	
	return nil
}

// verifyDataIntegrity checks if the data was properly inserted
func verifyDataIntegrity(db *gorm.DB) error {
	// Count workers
	var workerCount int64
	if err := db.Model(&model.Worker{}).Count(&workerCount).Error; err != nil {
		return err
	}
	log.Printf("Worker count: %d (expected: %d)", workerCount, NumWorkers)
	
	// Count projects
	var projectCount int64
	if err := db.Model(&model.Project{}).Count(&projectCount).Error; err != nil {
		return err
	}
	log.Printf("Project count: %d (expected: %d)", projectCount, NumProjects)
	
	// Count worker-project assignments
	var assignmentCount int64
	if err := db.Table("worker_projects").Count(&assignmentCount).Error; err != nil {
		return err
	}
	log.Printf("Assignment count: %d", assignmentCount)
	
	return nil
}

// min returns the smaller of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
} 