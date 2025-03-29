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
			// Add all your other workers here
		},
	}
}

func (r *Repository) GetAllWorkers() ([]model.Worker, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	return r.workers, nil
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
