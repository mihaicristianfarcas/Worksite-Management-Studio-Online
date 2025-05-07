package data

import (
	"math/rand"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/go-faker/faker/v4"
)

// Project statuses
var projectStatuses = []string{"active", "completed", "on_hold", "cancelled"}

// Worker positions
var workerPositions = []string{
	"Project Manager", "Civil Engineer", "Architect", "Structural Engineer", 
	"Electrician", "Plumber", "Carpenter", "Welder", "Crane Operator", 
	"Heavy Equipment Operator", "Surveyor", "Safety Inspector", 
	"Foreman", "Laborer", "Painter", "Masonry Worker", "HVAC Technician",
}

// GenerateFakeWorker creates a single worker with fake data
func GenerateFakeWorker() model.Worker {
	return model.Worker{
		Name:      faker.Name(),
		Age:       rand.Intn(60) + 18, // Random age between 18 and 77
		Position:  workerPositions[rand.Intn(len(workerPositions))],
		Salary:    30000 + rand.Intn(90000), // Random salary between 30,000 and 120,000
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// GenerateFakeProject creates a single project with fake data
func GenerateFakeProject() model.Project {
	// Create a start date between 2 years ago and today
	startDate := time.Now().AddDate(0, 0, -rand.Intn(730))
	
	// 70% chance to have an end date
	var endDate *time.Time
	if rand.Float32() < 0.7 {
		end := startDate.AddDate(0, rand.Intn(24), rand.Intn(30)) // Random duration up to 2 years
		endDate = &end
	}

	// Generate a random global latitude and longitude
	latitude := (rand.Float64() * 170) - 85 // -85 to +85
	longitude := (rand.Float64() * 360) - 180 // -180 to +180
	
	return model.Project{
		Name:        faker.Sentence(),
		Description: faker.Paragraph(),
		Status:      projectStatuses[rand.Intn(len(projectStatuses))],
		StartDate:   startDate,
		EndDate:     endDate,
		Latitude:    latitude,
		Longitude:   longitude,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
} 