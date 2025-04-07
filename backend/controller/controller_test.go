package controller

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func setupTestRepository() *repository.Repository {
	// Initialize an empty repository for testing
	return repository.NewRepository()
}

func TestGetAllWorkers(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/workers", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	
	repo := setupTestRepository()
	
	// Add a test worker to the repository
	testWorker := model.Worker{ID: "1", Name: "Test", Age: 30, Position: "Developer", Salary: 3000}
	repo.CreateWorker(testWorker)
	
	controller := NewController(repo)
	
	// Act
	if err := controller.GetAllWorkers(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Assert
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rec.Code)
	}
	
	var workers []model.Worker
	if err := json.Unmarshal(rec.Body.Bytes(), &workers); err != nil {
		t.Fatalf("Expected valid JSON, got error: %v", err)
	}
	
	if len(workers) == 0 {
		t.Fatalf("Expected at least 1 worker, got %d", len(workers))
	}
	
	foundTestWorker := false
	for _, w := range workers {
		if w.ID == testWorker.ID {
			foundTestWorker = true
			break
		}
	}
	
	if !foundTestWorker {
		t.Fatal("Expected to find the test worker in the response")
	}
}

func TestGetWorker(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("1")
	
	repo := setupTestRepository()
	
	// Add a test worker to the repository
	testWorker := model.Worker{ID: "1", Name: "Test", Age: 30, Position: "Developer", Salary: 3000}
	repo.CreateWorker(testWorker)
	
	controller := NewController(repo)
	
	// Act
	if err := controller.GetWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Assert
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rec.Code)
	}
	
	var worker model.Worker
	if err := json.Unmarshal(rec.Body.Bytes(), &worker); err != nil {
		t.Fatalf("Expected valid JSON, got error: %v", err)
	}
	
	if worker.ID != "1" {
		t.Fatalf("Expected worker ID '1', got '%s'", worker.ID)
	}
	
	// Test non-existent worker
	req = httptest.NewRequest(http.MethodGet, "/", nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("non-existent")
	
	if err := controller.GetWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if rec.Code != http.StatusNotFound {
		t.Fatalf("Expected status code %d, got %d", http.StatusNotFound, rec.Code)
	}
}

func TestCreateWorker(t *testing.T) {
	// Setup
	e := echo.New()
	workerJSON := `{"id":"2","name":"New Worker","age":25,"position":"Engineer","salary":4000}`
	req := httptest.NewRequest(http.MethodPost, "/api/workers", strings.NewReader(workerJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	
	repo := setupTestRepository()
	controller := NewController(repo)
	
	// Act
	if err := controller.CreateWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Assert
	if rec.Code != http.StatusCreated {
		t.Fatalf("Expected status code %d, got %d", http.StatusCreated, rec.Code)
	}
	
	var worker model.Worker
	if err := json.Unmarshal(rec.Body.Bytes(), &worker); err != nil {
		t.Fatalf("Expected valid JSON, got error: %v", err)
	}
	
	if worker.ID != "2" {
		t.Fatalf("Expected worker ID '2', got '%s'", worker.ID)
	}
	
	// Test invalid JSON
	req = httptest.NewRequest(http.MethodPost, "/api/workers", strings.NewReader("invalid json"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	
	if err := controller.CreateWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("Expected status code %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestUpdateWorker(t *testing.T) {
	// Setup
	e := echo.New()
	repo := setupTestRepository()
	
	// Add a test worker to the repository
	testWorker := model.Worker{ID: "3", Name: "Test", Age: 30, Position: "Developer", Salary: 3000}
	repo.CreateWorker(testWorker)
	
	workerJSON := `{"id":"3","name":"Updated Worker","age":32,"position":"Senior Developer","salary":5000}`
	req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(workerJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("3")
	
	controller := NewController(repo)
	
	// Act
	if err := controller.UpdateWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Assert
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rec.Code)
	}
	
	var worker model.Worker
	if err := json.Unmarshal(rec.Body.Bytes(), &worker); err != nil {
		t.Fatalf("Expected valid JSON, got error: %v", err)
	}
	
	if worker.Name != "Updated Worker" {
		t.Fatalf("Expected worker name 'Updated Worker', got '%s'", worker.Name)
	}
	
	// Test non-existent worker
	req = httptest.NewRequest(http.MethodPut, "/", strings.NewReader(workerJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("non-existent")
	
	if err := controller.UpdateWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if rec.Code != http.StatusNotFound {
		t.Fatalf("Expected status code %d, got %d", http.StatusNotFound, rec.Code)
	}
}

func TestDeleteWorker(t *testing.T) {
	// Setup
	e := echo.New()
	repo := setupTestRepository()
	
	// Add a test worker to the repository
	testWorker := model.Worker{ID: "5", Name: "Test", Age: 30, Position: "Developer", Salary: 3000}
	repo.CreateWorker(testWorker)
	
	req := httptest.NewRequest(http.MethodDelete, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("5")
	
	controller := NewController(repo)
	
	// Act
	if err := controller.DeleteWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Assert
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status code %d, got %d", http.StatusOK, rec.Code)
	}
	
	// Test non-existent worker
	req = httptest.NewRequest(http.MethodDelete, "/", nil)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)
	c.SetPath("/api/workers/:id")
	c.SetParamNames("id")
	c.SetParamValues("non-existent")
	
	if err := controller.DeleteWorker(c); err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if rec.Code != http.StatusNotFound {
		t.Fatalf("Expected status code %d, got %d", http.StatusNotFound, rec.Code)
	}
}

func TestGetAllWorkersWithFilters(t *testing.T) {
	// Setup
	e := echo.New()
	repo := repository.NewRepository()
	controller := NewController(repo)

	// Add test workers
	workers := []model.Worker{
		{ID: "1", Name: "John", Age: 25, Position: "Developer", Salary: 50000},
		{ID: "2", Name: "Jane", Age: 30, Position: "Manager", Salary: 70000},
		{ID: "3", Name: "Bob", Age: 35, Position: "Developer", Salary: 60000},
		{ID: "4", Name: "Alice", Age: 28, Position: "Developer", Salary: 55000},
		{ID: "5", Name: "Charlie", Age: 32, Position: "Manager", Salary: 75000},
	}
	for _, w := range workers {
		repo.CreateWorker(w)
	}

	// Test cases
	tests := []struct {
		name           string
		query          string
		expectedCount  int
		expectedStatus int
		verifyResults  func(t *testing.T, response PaginatedResponse)
	}{
		{
			name:           "Filter by position",
			query:          "?position=Developer",
			expectedCount:  3,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for _, worker := range response.Data {
					assert.Equal(t, "Developer", worker.Position)
				}
			},
		},
		{
			name:           "Filter by age range",
			query:          "?min_age=25&max_age=30",
			expectedCount:  3,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for _, worker := range response.Data {
					assert.GreaterOrEqual(t, worker.Age, 25)
					assert.LessOrEqual(t, worker.Age, 30)
				}
			},
		},
		{
			name:           "Filter by salary range",
			query:          "?min_salary=55000&max_salary=65000",
			expectedCount:  2,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for _, worker := range response.Data {
					assert.GreaterOrEqual(t, worker.Salary, 55000)
					assert.LessOrEqual(t, worker.Salary, 65000)
				}
			},
		},
		{
			name:           "Sort by name ascending",
			query:          "?sort_by=name&sort_order=asc",
			expectedCount:  5,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for i := 1; i < len(response.Data); i++ {
					assert.LessOrEqual(t, response.Data[i-1].Name, response.Data[i].Name)
				}
			},
		},
		{
			name:           "Sort by salary descending",
			query:          "?sort_by=salary&sort_order=desc",
			expectedCount:  5,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for i := 1; i < len(response.Data); i++ {
					assert.GreaterOrEqual(t, response.Data[i-1].Salary, response.Data[i].Salary)
				}
			},
		},
		{
			name:           "Combined filters",
			query:          "?position=Developer&min_age=25&max_age=35&min_salary=50000&max_salary=60000",
			expectedCount:  3,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				for _, worker := range response.Data {
					assert.Equal(t, "Developer", worker.Position)
					assert.GreaterOrEqual(t, worker.Age, 25)
					assert.LessOrEqual(t, worker.Age, 35)
					assert.GreaterOrEqual(t, worker.Salary, 50000)
					assert.LessOrEqual(t, worker.Salary, 60000)
				}
			},
		},
		{
			name:           "Pagination",
			query:          "?page=1&pageSize=2",
			expectedCount:  2,
			expectedStatus: http.StatusOK,
			verifyResults: func(t *testing.T, response PaginatedResponse) {
				assert.Equal(t, 1, response.Page)
				assert.Equal(t, 2, response.PageSize)
				assert.Equal(t, 5, response.Total)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/api/workers"+tt.query, nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := controller.GetAllWorkers(c)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, rec.Code)

			var response PaginatedResponse
			err = json.Unmarshal(rec.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Len(t, response.Data, tt.expectedCount)

			if tt.verifyResults != nil {
				tt.verifyResults(t, response)
			}
		})
	}
}

func TestCreateWorkerValidation(t *testing.T) {
    // Setup
    e := echo.New()
    e.HTTPErrorHandler = echo.New().DefaultHTTPErrorHandler
    
    repo := repository.NewRepository()
    controller := NewController(repo)

    // Test cases
    tests := []struct {
        name           string
        worker         model.Worker
        expectedStatus int
    }{
        {
            name: "Valid worker",
            worker: model.Worker{
                ID:       "1",
                Name:     "John Doe",
                Age:      25,
                Position: "Developer",
                Salary:   50000,
            },
            expectedStatus: http.StatusCreated,
        },
        {
            name: "Invalid age",
            worker: model.Worker{
                ID:       "2",
                Name:     "Young Worker",
                Age:      15, // Below minimum age
                Position: "Intern",
                Salary:   20000,
            },
            expectedStatus: http.StatusBadRequest,
        },
        {
            name: "Invalid name length",
            worker: model.Worker{
                ID:       "3",
                Name:     "A", // Too short
                Age:      25,
                Position: "Developer",
                Salary:   50000,
            },
            expectedStatus: http.StatusBadRequest,
        },
        {
            name: "Invalid salary",
            worker: model.Worker{
                ID:       "4",
                Name:     "John Doe",
                Age:      25,
                Position: "Developer",
                Salary:   -1000, // Negative salary
            },
            expectedStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            workerJSON, _ := json.Marshal(tt.worker)
            req := httptest.NewRequest(http.MethodPost, "/workers", bytes.NewReader(workerJSON))
            req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
            rec := httptest.NewRecorder()
            c := e.NewContext(req, rec)

            // Use Echo's error handling middleware to process any errors
            if err := controller.CreateWorker(c); err != nil {
                e.HTTPErrorHandler(err, c)
            }
            
            // Now we can directly check the recorder's status code
            assert.Equal(t, tt.expectedStatus, rec.Code)
        })
    }
}

func TestUpdateWorkerValidation(t *testing.T) {
    // Setup
    e := echo.New()
    // Add Echo's HTTP error handler middleware
    e.HTTPErrorHandler = echo.New().DefaultHTTPErrorHandler
    
    repo := repository.NewRepository()
    controller := NewController(repo)

    // Add initial worker
    initialWorker := model.Worker{
        ID:       "1",
        Name:     "John Doe",
        Age:      25,
        Position: "Developer",
        Salary:   50000,
    }
    repo.CreateWorker(initialWorker)

    // Test cases
    tests := []struct {
        name           string
        worker         model.Worker
        expectedStatus int
    }{
        {
            name: "Valid update",
            worker: model.Worker{
                ID:       "1",
                Name:     "John Updated",
                Age:      26,
                Position: "Senior Developer",
                Salary:   60000,
            },
            expectedStatus: http.StatusOK,
        },
        {
            name: "Invalid age update",
            worker: model.Worker{
                ID:       "1",
                Name:     "John Doe",
                Age:      15, // Below minimum age
                Position: "Developer",
                Salary:   50000,
            },
            expectedStatus: http.StatusBadRequest,
        },
        {
            name: "Invalid salary update",
            worker: model.Worker{
                ID:       "1",
                Name:     "John Doe",
                Age:      25,
                Position: "Developer",
                Salary:   -1000, // Negative salary
            },
            expectedStatus: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            workerJSON, _ := json.Marshal(tt.worker)
            req := httptest.NewRequest(http.MethodPatch, "/workers/1", bytes.NewReader(workerJSON))
            req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
            rec := httptest.NewRecorder()
            c := e.NewContext(req, rec)
            c.SetPath("/workers/:id")
            c.SetParamNames("id")
            c.SetParamValues("1")

            // Use Echo's error handling middleware to process any errors
            if err := controller.UpdateWorker(c); err != nil {
                e.HTTPErrorHandler(err, c)
            }
            
            // Now we can directly check the recorder's status code
            assert.Equal(t, tt.expectedStatus, rec.Code)
        })
    }
}
