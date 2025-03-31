package controller

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
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
