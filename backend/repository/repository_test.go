package repository

import (
	"testing"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) {
	// Use a test database
	config.DB = nil
	config.InitDB()
}

func TestWorkerRepository(t *testing.T) {
	setupTestDB(t)
	repo := NewWorkerRepository()

	// Test Create
	t.Run("Create Worker", func(t *testing.T) {
		worker := &model.Worker{
			Name:     "John Doe",
			Age:      25,
			Position: "Senior Developer",
			Salary:   75000,
		}
		err := repo.Create(worker)
		assert.NoError(t, err)
		assert.NotZero(t, worker.ID)
	})

	// Test GetByID
	t.Run("Get Worker By ID", func(t *testing.T) {
		// Create a test worker first
		worker := &model.Worker{
			Name:     "Jane Smith",
			Age:      28,
			Position: "Senior Developer",
			Salary:   80000,
		}
		err := repo.Create(worker)
		assert.NoError(t, err)
		assert.NotZero(t, worker.ID)

		// Now test getting the worker
		retrieved, err := repo.GetByID(worker.ID)
		assert.NoError(t, err)
		assert.Equal(t, worker.Name, retrieved.Name)
		assert.Equal(t, worker.Age, retrieved.Age)
		assert.Equal(t, worker.Position, retrieved.Position)
		assert.Equal(t, worker.Salary, retrieved.Salary)
	})

	// Test GetAll with filters
	t.Run("Get All Workers with Filters", func(t *testing.T) {
		// Create multiple test workers
		workers := []*model.Worker{
			{
				Name:     "Alice Johnson",
				Age:      25,
				Position: "Senior Developer",
				Salary:   75000,
			},
			{
				Name:     "Bob Wilson",
				Age:      35,
				Position: "Junior Developer",
				Salary:   45000,
			},
			{
				Name:     "Carol Brown",
				Age:      28,
				Position: "Senior Developer",
				Salary:   78000,
			},
		}

		for _, w := range workers {
			err := repo.Create(w)
			assert.NoError(t, err)
		}

		filters := map[string]interface{}{
			"position": "Senior Developer",
			"min_age":  20,
			"max_age":  30,
			"min_salary": 50000,
		}
		results, err := repo.GetAll(filters, "name", "asc")
		assert.NoError(t, err)
		assert.Greater(t, len(results), 0)
		
		for _, worker := range results {
			assert.Equal(t, "Senior Developer", worker.Position)
			assert.GreaterOrEqual(t, worker.Age, 20)
			assert.LessOrEqual(t, worker.Age, 30)
			assert.GreaterOrEqual(t, worker.Salary, 50000)
		}
	})

	// Test Update
	t.Run("Update Worker", func(t *testing.T) {
		// Create a test worker first
		worker := &model.Worker{
			Name:     "David Lee",
			Age:      30,
			Position: "Senior Developer",
			Salary:   70000,
		}
		err := repo.Create(worker)
		assert.NoError(t, err)

		// Update the worker
		worker.Salary = 80000
		worker.Position = "Lead Developer"
		err = repo.Update(worker)
		assert.NoError(t, err)

		// Verify the update
		updated, err := repo.GetByID(worker.ID)
		assert.NoError(t, err)
		assert.Equal(t, 80000, updated.Salary)
		assert.Equal(t, "Lead Developer", updated.Position)
	})

	// Test Delete
	t.Run("Delete Worker", func(t *testing.T) {
		// Create a test worker first
		worker := &model.Worker{
			Name:     "Eve Davis",
			Age:      27,
			Position: "Developer",
			Salary:   65000,
		}
		err := repo.Create(worker)
		assert.NoError(t, err)

		// Delete the worker
		err = repo.Delete(worker.ID)
		assert.NoError(t, err)

		// Verify deletion
		_, err = repo.GetByID(worker.ID)
		assert.Error(t, err)
	})
}

func TestProjectRepository(t *testing.T) {
	setupTestDB(t)
	repo := NewProjectRepository()

	// Test Create
	t.Run("Create Project", func(t *testing.T) {
		project := &model.Project{
			Name:        "Website Redesign",
			Description: "Complete overhaul of the company website with modern design and improved functionality",
			Status:      "active",
			StartDate:   time.Now(),
		}
		err := repo.Create(project)
		assert.NoError(t, err)
		assert.NotZero(t, project.ID)
	})

	// Test GetByID
	t.Run("Get Project By ID", func(t *testing.T) {
		// Create a test project first
		project := &model.Project{
			Name:        "Mobile App Development",
			Description: "Development of a new mobile application for iOS and Android platforms",
			Status:      "active",
			StartDate:   time.Now(),
		}
		err := repo.Create(project)
		assert.NoError(t, err)

		// Now test getting the project
		retrieved, err := repo.GetByID(project.ID)
		assert.NoError(t, err)
		assert.Equal(t, project.Name, retrieved.Name)
		assert.Equal(t, project.Status, retrieved.Status)
		assert.Equal(t, project.Description, retrieved.Description)
	})

	// Test GetAll with filters
	t.Run("Get All Projects with Filters", func(t *testing.T) {
		// Create multiple test projects
		projects := []*model.Project{
			{
				Name:        "Project A",
				Description: "Description for Project A",
				Status:      "active",
				StartDate:   time.Now(),
			},
			{
				Name:        "Project B",
				Description: "Description for Project B",
				Status:      "completed",
				StartDate:   time.Now(),
			},
			{
				Name:        "Project C",
				Description: "Description for Project C",
				Status:      "active",
				StartDate:   time.Now(),
			},
		}

		for _, p := range projects {
			err := repo.Create(p)
			assert.NoError(t, err)
		}

		filters := map[string]interface{}{
			"status": "active",
		}
		results, err := repo.GetAll(filters, "name", "asc")
		assert.NoError(t, err)
		assert.Greater(t, len(results), 0)
		
		for _, project := range results {
			assert.Equal(t, "active", project.Status)
		}
	})

	// Test Update
	t.Run("Update Project", func(t *testing.T) {
		// Create a test project first
		project := &model.Project{
			Name:        "Project D",
			Description: "Description for Project D",
			Status:      "active",
			StartDate:   time.Now(),
		}
		err := repo.Create(project)
		assert.NoError(t, err)

		// Update the project
		project.Status = "completed"
		endDate := time.Now()
		project.EndDate = &endDate
		err = repo.Update(project)
		assert.NoError(t, err)

		// Verify the update
		updated, err := repo.GetByID(project.ID)
		assert.NoError(t, err)
		assert.Equal(t, "completed", updated.Status)
		assert.NotNil(t, updated.EndDate)
	})

	// Test Delete
	t.Run("Delete Project", func(t *testing.T) {
		// Create a test project first
		project := &model.Project{
			Name:        "Project E",
			Description: "Description for Project E",
			Status:      "active",
			StartDate:   time.Now(),
		}
		err := repo.Create(project)
		assert.NoError(t, err)

		// Delete the project
		err = repo.Delete(project.ID)
		assert.NoError(t, err)

		// Verify deletion
		_, err = repo.GetByID(project.ID)
		assert.Error(t, err)
	})
}

func TestWorkerProjectRelationship(t *testing.T) {
	setupTestDB(t)
	workerRepo := NewWorkerRepository()
	projectRepo := NewProjectRepository()

	// Create test worker
	worker := &model.Worker{
		Name:     "John Doe",
		Age:      25,
		Position: "Senior Developer",
		Salary:   75000,
	}
	err := workerRepo.Create(worker)
	assert.NoError(t, err)

	// Create test project
	project := &model.Project{
		Name:        "Website Redesign",
		Description: "Complete overhaul of the company website with modern design and improved functionality",
		Status:      "active",
		StartDate:   time.Now(),
	}
	err = projectRepo.Create(project)
	assert.NoError(t, err)

	// Test AddToProject
	t.Run("Add Worker to Project", func(t *testing.T) {
		err := workerRepo.AddToProject(worker.ID, project.ID)
		assert.NoError(t, err)

		// Verify relationship
		worker, err := workerRepo.GetByID(worker.ID)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(worker.Projects))
		assert.Equal(t, project.ID, worker.Projects[0].ID)

		// Verify from project side
		project, err := projectRepo.GetByID(project.ID)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(project.Workers))
		assert.Equal(t, worker.ID, project.Workers[0].ID)
	})

	// Test RemoveFromProject
	t.Run("Remove Worker from Project", func(t *testing.T) {
		err := workerRepo.RemoveFromProject(worker.ID, project.ID)
		assert.NoError(t, err)

		// Verify relationship removed from worker side
		worker, err := workerRepo.GetByID(worker.ID)
		assert.NoError(t, err)
		assert.Equal(t, 0, len(worker.Projects))

		// Verify relationship removed from project side
		project, err := projectRepo.GetByID(project.ID)
		assert.NoError(t, err)
		assert.Equal(t, 0, len(project.Workers))
	})
}
