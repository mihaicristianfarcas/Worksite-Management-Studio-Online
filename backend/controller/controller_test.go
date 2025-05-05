package controller

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func setupTestControllers() (*WorkerController, *ProjectController) {
	// Initialize test database
	config.DB = nil
	config.InitDB()

	workerRepo := repository.NewWorkerRepository()
	projectRepo := repository.NewProjectRepository()
	return NewWorkerController(workerRepo), NewProjectController(projectRepo)
}

func TestWorkerController(t *testing.T) {
	workerCtrl, _ := setupTestControllers()
	e := echo.New()

	// Test CreateWorker
	t.Run("Create Worker", func(t *testing.T) {
		worker := model.Worker{
			Name:     "John Doe",
			Age:      25,
			Position: "Senior Developer",
			Salary:   75000,
		}
		jsonData, _ := json.Marshal(worker)

		req := httptest.NewRequest(http.MethodPost, "/api/workers", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := workerCtrl.CreateWorker(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, worker.Name, response.Name)
		assert.Equal(t, worker.Age, response.Age)
		assert.Equal(t, worker.Position, response.Position)
		assert.Equal(t, worker.Salary, response.Salary)
	})

	// Test CreateWorker with invalid data
	t.Run("Create Worker with Invalid Data", func(t *testing.T) {
		invalidWorker := model.Worker{
			Name:     "J", // Too short
			Age:      16,  // Too young
			Position: "D", // Too short
			Salary:   -1000, // Negative salary
		}
		jsonData, _ := json.Marshal(invalidWorker)

		req := httptest.NewRequest(http.MethodPost, "/api/workers", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := workerCtrl.CreateWorker(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, rec.Code)

		// Verify error response
		var response map[string]interface{}
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response, "error")
	})

	// Test GetAllWorkers
	t.Run("Get All Workers", func(t *testing.T) {
		// Create a test worker first
		worker := model.Worker{
			Name:     "Jane Smith",
			Age:      28,
			Position: "Senior Developer",
			Salary:   80000,
		}
		jsonData, _ := json.Marshal(worker)
		req := httptest.NewRequest(http.MethodPost, "/api/workers", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := workerCtrl.CreateWorker(c)
		assert.NoError(t, err)

		// Now test getting all workers
		req = httptest.NewRequest(http.MethodGet, "/api/workers", nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)

		err = workerCtrl.GetAllWorkers(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)

		// Find our newly created worker
		var foundWorker *model.Worker
		for i := range response {
			if response[i].Name == worker.Name {
				foundWorker = &response[i]
				break
			}
		}
		assert.NotNil(t, foundWorker, "Created worker not found in response")
		if foundWorker != nil {
			assert.Equal(t, worker.Name, foundWorker.Name)
			assert.Equal(t, worker.Age, foundWorker.Age)
			assert.Equal(t, worker.Position, foundWorker.Position)
			assert.Equal(t, worker.Salary, foundWorker.Salary)
		}
	})

	// Test GetWorker
	t.Run("Get Worker By ID", func(t *testing.T) {
		// Create a test worker first
		worker := model.Worker{
			Name:     "Alice Johnson",
			Age:      30,
			Position: "Lead Developer",
			Salary:   90000,
		}
		jsonData, _ := json.Marshal(worker)
		req := httptest.NewRequest(http.MethodPost, "/api/workers", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := workerCtrl.CreateWorker(c)
		assert.NoError(t, err)

		var createdWorker model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &createdWorker)
		assert.NoError(t, err)

		// Now test getting the worker
		req = httptest.NewRequest(http.MethodGet, "/api/workers/"+strconv.FormatUint(uint64(createdWorker.ID), 10), nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		c.SetPath("/api/workers/:id")
		c.SetParamNames("id")
		c.SetParamValues(strconv.FormatUint(uint64(createdWorker.ID), 10))

		err = workerCtrl.GetWorker(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, createdWorker.ID, response.ID)
		assert.Equal(t, worker.Name, response.Name)
		assert.Equal(t, worker.Age, response.Age)
		assert.Equal(t, worker.Position, response.Position)
		assert.Equal(t, worker.Salary, response.Salary)
	})
}

func TestProjectController(t *testing.T) {
	_, projectCtrl := setupTestControllers()
	e := echo.New()

	// Test CreateProject
	t.Run("Create Project", func(t *testing.T) {
		project := model.Project{
			Name:        "Website Redesign",
			Description: "Complete overhaul of the company website with modern design and improved functionality",
			Status:      "active",
			StartDate:   time.Now(),
			Latitude:    45.123456,
			Longitude:   -122.123456,
		}
		jsonData, _ := json.Marshal(project)

		req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := projectCtrl.CreateProject(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, rec.Code)

		var response model.Project
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, project.Name, response.Name)
		assert.Equal(t, project.Description, response.Description)
		assert.Equal(t, project.Status, response.Status)
		assert.NotNil(t, response.StartDate)
	})

	// Test CreateProject with invalid data
	t.Run("Create Project with Invalid Data", func(t *testing.T) {
		invalidProject := model.Project{
			Name:        "W", // Too short
			Description: "Too short", // Too short
			Status:      "invalid_status", // Invalid status
			StartDate:   time.Now(),
		}
		jsonData, _ := json.Marshal(invalidProject)

		req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		err := projectCtrl.CreateProject(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, rec.Code)
	})

	// Test GetAllProjects
	t.Run("Get All Projects", func(t *testing.T) {
		// Create a test project first
		project := model.Project{
			Name:        "Mobile App Development",
			Description: "Development of a new mobile application for iOS and Android platforms",
			Status:      "active",
			StartDate:   time.Now(),
			Latitude:    45.123456,
			Longitude:   -122.123456,
		}
		jsonData, _ := json.Marshal(project)
		req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := projectCtrl.CreateProject(c)
		assert.NoError(t, err)

		// Now test getting all projects
		req = httptest.NewRequest(http.MethodGet, "/api/projects", nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)

		err = projectCtrl.GetAllProjects(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response []model.Project
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)

		// Find our newly created project
		var foundProject *model.Project
		for i := range response {
			if response[i].Name == project.Name {
				foundProject = &response[i]
				break
			}
		}
		assert.NotNil(t, foundProject, "Created project not found in response")
		if foundProject != nil {
			assert.Equal(t, project.Name, foundProject.Name)
			assert.Equal(t, project.Description, foundProject.Description)
			assert.Equal(t, project.Status, foundProject.Status)
			assert.NotNil(t, foundProject.StartDate)
		}
	})

	// Test GetProject
	t.Run("Get Project By ID", func(t *testing.T) {
		// Create a test project first
		project := model.Project{
			Name:        "Project X",
			Description: "A comprehensive project with multiple phases and deliverables",
			Status:      "active",
			StartDate:   time.Now(),
			Latitude:    45.123456,
			Longitude:   -122.123456,
		}
		jsonData, _ := json.Marshal(project)
		req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewBuffer(jsonData))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		err := projectCtrl.CreateProject(c)
		assert.NoError(t, err)

		var createdProject model.Project
		err = json.Unmarshal(rec.Body.Bytes(), &createdProject)
		assert.NoError(t, err)

		// Now test getting the project
		req = httptest.NewRequest(http.MethodGet, "/api/projects/"+strconv.FormatUint(uint64(createdProject.ID), 10), nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		c.SetPath("/api/projects/:id")
		c.SetParamNames("id")
		c.SetParamValues(strconv.FormatUint(uint64(createdProject.ID), 10))

		err = projectCtrl.GetProject(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var response model.Project
		err = json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, createdProject.ID, response.ID)
		assert.Equal(t, project.Name, response.Name)
		assert.Equal(t, project.Description, response.Description)
		assert.Equal(t, project.Status, response.Status)
		assert.NotNil(t, response.StartDate)
	})
}

func TestWorkerProjectRelationship(t *testing.T) {
	workerCtrl, projectCtrl := setupTestControllers()
	e := echo.New()

	// Create a test worker
	worker := model.Worker{
		Name:     "John Doe",
		Age:      25,
		Position: "Senior Developer",
		Salary:   75000,
	}
	jsonData, _ := json.Marshal(worker)
	req := httptest.NewRequest(http.MethodPost, "/api/workers", bytes.NewBuffer(jsonData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := workerCtrl.CreateWorker(c)
	assert.NoError(t, err)

	var createdWorker model.Worker
	err = json.Unmarshal(rec.Body.Bytes(), &createdWorker)
	assert.NoError(t, err)

	// Create a test project
	project := model.Project{
		Name:        "Website Redesign",
		Description: "Complete overhaul of the company website with modern design and improved functionality",
		Status:      "active",
		StartDate:   time.Now(),
		Latitude:    45.123456,
		Longitude:   -122.123456,
	}
	jsonData, _ = json.Marshal(project)
	req = httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewBuffer(jsonData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	err = projectCtrl.CreateProject(c)
	assert.NoError(t, err)

	var createdProject model.Project
	err = json.Unmarshal(rec.Body.Bytes(), &createdProject)
	assert.NoError(t, err)

	// Test AddToProject
	t.Run("Add Worker to Project", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/workers/"+strconv.FormatUint(uint64(createdWorker.ID), 10)+"/projects/"+strconv.FormatUint(uint64(createdProject.ID), 10), nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/api/workers/:workerId/projects/:projectId")
		c.SetParamNames("workerId", "projectId")
		c.SetParamValues(strconv.FormatUint(uint64(createdWorker.ID), 10), strconv.FormatUint(uint64(createdProject.ID), 10))

		err := workerCtrl.AddToProject(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNoContent, rec.Code)

		// Verify worker has project
		req = httptest.NewRequest(http.MethodGet, "/api/workers/"+strconv.FormatUint(uint64(createdWorker.ID), 10), nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		c.SetPath("/api/workers/:id")
		c.SetParamNames("id")
		c.SetParamValues(strconv.FormatUint(uint64(createdWorker.ID), 10))

		err = workerCtrl.GetWorker(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var worker model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &worker)
		assert.NoError(t, err)
		assert.Equal(t, 1, len(worker.Projects))
		assert.Equal(t, createdProject.ID, worker.Projects[0].ID)
	})

	// Test RemoveFromProject
	t.Run("Remove Worker from Project", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/workers/"+strconv.FormatUint(uint64(createdWorker.ID), 10)+"/projects/"+strconv.FormatUint(uint64(createdProject.ID), 10), nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		c.SetPath("/api/workers/:workerId/projects/:projectId")
		c.SetParamNames("workerId", "projectId")
		c.SetParamValues(strconv.FormatUint(uint64(createdWorker.ID), 10), strconv.FormatUint(uint64(createdProject.ID), 10))

		err := workerCtrl.RemoveFromProject(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNoContent, rec.Code)

		// Verify worker no longer has project
		req = httptest.NewRequest(http.MethodGet, "/api/workers/"+strconv.FormatUint(uint64(createdWorker.ID), 10), nil)
		rec = httptest.NewRecorder()
		c = e.NewContext(req, rec)
		c.SetPath("/api/workers/:id")
		c.SetParamNames("id")
		c.SetParamValues(strconv.FormatUint(uint64(createdWorker.ID), 10))

		err = workerCtrl.GetWorker(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)

		var worker model.Worker
		err = json.Unmarshal(rec.Body.Bytes(), &worker)
		assert.NoError(t, err)
		assert.Equal(t, 0, len(worker.Projects))
	})
}
