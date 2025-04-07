package repository

import (
	"errors"
	"sync"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
)

type Repository struct {
	workers []model.Worker
	mutex   sync.RWMutex
}

func NewRepository() *Repository {
	// Initialize with worker data
	return &Repository{
		workers: []model.Worker{
			{ID: "m5gr84i9", Name: "Dorel", Age: 34, Position: "Dulgher", Salary: 2000},
			{ID: "fafwe9f9", Name: "Sica", Age: 17, Position: "Cu roaba", Salary: 1000},
			{ID: "egei4i9k", Name: "Mirel", Age: 23, Position: "Pe buldo", Salary: 3000},
			{ID: "aegk569b", Name: "Marcel", Age: 55, Position: "Pavator", Salary: 1500},
			{ID: "favke9fo", Name: "Ursu", Age: 46, Position: "Fierar", Salary: 2500},
			{ID: "f3rqf9qu", Name: "Ion", Age: 30, Position: "Zidar", Salary: 1800},
			{ID: "081u2r8f", Name: "Gheorghe", Age: 40, Position: "Zugrav", Salary: 2200},
			{ID: "f9qf9qf9", Name: "Mihai", Age: 28, Position: "Electrician", Salary: 2800},
			{ID: "jbnpis3r", Name: "Vasile", Age: 37, Position: "Instalator", Salary: 1900},
			{ID: "sbrgw4gq", Name: "Costel", Age: 42, Position: "Faiantar", Salary: 2400},
			{ID: "brg4wgwq", Name: "Florin", Age: 49, Position: "Sudor", Salary: 2600},
			{ID: "gdgewg32", Name: "Marius", Age: 32, Position: "Vopsitor", Salary: 2100},
			{ID: "t3geg33r", Name: "Adrian", Age: 38, Position: "Tencuitor", Salary: 2700},
			{ID: "352t3twe", Name: "Cristian", Age: 27, Position: "Sapator", Salary: 2300},
		},
	}
}

// GetAllWorkers returns all workers without any filtering or sorting
func (r *Repository) GetAllWorkers() ([]model.Worker, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return r.workers, nil
}

// GetFilteredWorkers returns workers filtered according to the provided parameters
func (r *Repository) GetFilteredWorkers(position string, minAge, maxAge, minSalary, maxSalary int) ([]model.Worker, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	// Create a copy of workers to avoid modifying the original slice
	workers := make([]model.Worker, len(r.workers))
	copy(workers, r.workers)

	// Apply filters
	var filteredWorkers []model.Worker
	for _, worker := range workers {
		if position != "" && worker.Position != position {
			continue
		}
		if minAge > 0 && worker.Age < minAge {
			continue
		}
		if maxAge > 0 && worker.Age > maxAge {
			continue
		}
		if minSalary > 0 && worker.Salary < minSalary {
			continue
		}
		if maxSalary > 0 && worker.Salary > maxSalary {
			continue
		}
		// If all filters pass, add the worker to the filtered list
		filteredWorkers = append(filteredWorkers, worker)
	}

	return filteredWorkers, nil
}

func (r *Repository) GetWorker(id string) (model.Worker, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	
	for _, worker := range r.workers {
		if worker.ID == id {
			return worker, nil
		}
	}
	
	return model.Worker{}, errors.New("worker not found")
}

func (r *Repository) CreateWorker(worker model.Worker) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	
	// Check if ID already exists
	for _, w := range r.workers {
		if w.ID == worker.ID {
			return errors.New("worker with this ID already exists")
		}
	}
	
	r.workers = append(r.workers, worker)
	return nil
}

func (r *Repository) UpdateWorker(worker model.Worker) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	
	for i, w := range r.workers {
		if w.ID == worker.ID {
			r.workers[i] = worker
			return nil
		}
	}
	
	return errors.New("worker not found")
}

func (r *Repository) DeleteWorker(id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	
	for i, worker := range r.workers {
		if worker.ID == id {
			// Remove worker by slicing
			r.workers = append(r.workers[:i], r.workers[i+1:]...)
			return nil
		}
	}
	
	return errors.New("worker not found")
}
