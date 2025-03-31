package repository

import (
	"testing"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
)

func TestNewRepository(t *testing.T) {
	repo := NewRepository()
	if repo == nil {
		t.Fatal("Expected repository to be created")
	}
}

func TestGetAllWorkers(t *testing.T) {
	repo := NewRepository()
	
	// Add some test workers
	testWorker := model.Worker{
		ID:       "test-id-1",
		Name:     "Test Worker",
		Age:      30,
		Position: "Tester",
		Salary:   2000,
	}
	
	repo.CreateWorker(testWorker)
	
	workers, err := repo.GetAllWorkers()
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if len(workers) == 0 {
		t.Fatal("Expected at least one worker")
	}
	
	found := false
	for _, w := range workers {
		if w.ID == testWorker.ID {
			found = true
			break
		}
	}
	
	if !found {
		t.Fatal("Expected to find the added worker")
	}
}

func TestGetWorker(t *testing.T) {
	repo := NewRepository()
	
	testWorker := model.Worker{
		ID:       "test-id-2",
		Name:     "Test Worker",
		Age:      30,
		Position: "Tester",
		Salary:   2000,
	}
	
	repo.CreateWorker(testWorker)
	
	worker, err := repo.GetWorker("test-id-2")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if worker.ID != testWorker.ID {
		t.Fatalf("Expected worker ID %s, got %s", testWorker.ID, worker.ID)
	}
	
	if worker.Name != testWorker.Name {
		t.Fatalf("Expected worker name %s, got %s", testWorker.Name, worker.Name)
	}
	
	// Test non-existent worker
	_, err = repo.GetWorker("non-existent-id")
	if err == nil {
		t.Fatal("Expected error for non-existent worker")
	}
}

func TestCreateWorker(t *testing.T) {
	repo := NewRepository()
	
	testWorker := model.Worker{
		ID:       "test-id-3",
		Name:     "Test Worker",
		Age:      30,
		Position: "Tester",
		Salary:   2000,
	}
	
	err := repo.CreateWorker(testWorker)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Check if worker was added
	worker, err := repo.GetWorker("test-id-3")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if worker.ID != testWorker.ID {
		t.Fatalf("Expected worker ID %s, got %s", testWorker.ID, worker.ID)
	}
	
	// Test duplicate worker
	err = repo.CreateWorker(testWorker)
	if err == nil {
		t.Fatal("Expected error for duplicate worker")
	}
}

func TestUpdateWorker(t *testing.T) {
	repo := NewRepository()
	
	testWorker := model.Worker{
		ID:       "test-id-4",
		Name:     "Test Worker",
		Age:      30,
		Position: "Tester",
		Salary:   2000,
	}
	
	repo.CreateWorker(testWorker)
	
	// Update worker
	updatedWorker := model.Worker{
		ID:       "test-id-4",
		Name:     "Updated Worker",
		Age:      35,
		Position: "Senior Tester",
		Salary:   3000,
	}
	
	err := repo.UpdateWorker(updatedWorker)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Check if worker was updated
	worker, err := repo.GetWorker("test-id-4")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	if worker.Name != updatedWorker.Name {
		t.Fatalf("Expected worker name %s, got %s", updatedWorker.Name, worker.Name)
	}
	
	if worker.Age != updatedWorker.Age {
		t.Fatalf("Expected worker age %d, got %d", updatedWorker.Age, worker.Age)
	}
	
	// Test update non-existent worker
	nonExistentWorker := model.Worker{
		ID:       "non-existent-id",
		Name:     "Non-existent Worker",
		Age:      40,
		Position: "Position",
		Salary:   4000,
	}
	
	err = repo.UpdateWorker(nonExistentWorker)
	if err == nil {
		t.Fatal("Expected error for non-existent worker")
	}
}

func TestDeleteWorker(t *testing.T) {
	repo := NewRepository()
	
	testWorker := model.Worker{
		ID:       "test-id-5",
		Name:     "Test Worker",
		Age:      30,
		Position: "Tester",
		Salary:   2000,
	}
	
	repo.CreateWorker(testWorker)
	
	err := repo.DeleteWorker("test-id-5")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	
	// Check if worker was deleted
	_, err = repo.GetWorker("test-id-5")
	if err == nil {
		t.Fatal("Expected error for deleted worker")
	}
	
	// Test delete non-existent worker
	err = repo.DeleteWorker("non-existent-id")
	if err == nil {
		t.Fatal("Expected error for non-existent worker")
	}
}
