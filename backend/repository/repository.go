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
			{ID: "355d7674", Name: "Mihaita", Age: 44, Position: "Dulgher", Salary: 2998},
			{ID: "u1gr84i1", Name: "Andrei", Age: 29, Position: "Dulgher", Salary: 2100},
			{ID: "u2gr84i2", Name: "Bogdan", Age: 31, Position: "Zidar", Salary: 2200},
			{ID: "u3gr84i3", Name: "Catalin", Age: 35, Position: "Fierar", Salary: 2500},
			{ID: "u4gr84i4", Name: "Daniel", Age: 28, Position: "Instalator", Salary: 2300},
			{ID: "u5gr84i5", Name: "Eugen", Age: 40, Position: "Sudor", Salary: 2700},
			{ID: "u6gr84i6", Name: "Florin", Age: 33, Position: "Vopsitor", Salary: 2400},
			{ID: "u7gr84i7", Name: "George", Age: 36, Position: "Tencuitor", Salary: 2600},
			{ID: "u8gr84i8", Name: "Horia", Age: 39, Position: "Sapator", Salary: 2500},
			{ID: "u9gr84i9", Name: "Ionut", Age: 32, Position: "Dulgher", Salary: 2200},
			{ID: "u10gr8i10", Name: "Jianu", Age: 34, Position: "Zugrav", Salary: 2300},
			{ID: "u11gr4i11", Name: "Klaus", Age: 41, Position: "Electrician", Salary: 2800},
			{ID: "u12g84i12", Name: "Laurentiu", Age: 37, Position: "Instalator", Salary: 2400},
			{ID: "u13r84i13", Name: "Marius", Age: 38, Position: "Faiantar", Salary: 2600},
			{ID: "u1gr84i14", Name: "Nicu", Age: 42, Position: "Sudor", Salary: 2700},
			{ID: "u5gr84i15", Name: "Ovidiu", Age: 30, Position: "Vopsitor", Salary: 2500},
			{ID: "16gr84i16", Name: "Paul", Age: 29, Position: "Tencuitor", Salary: 2400},
			{ID: "u17gr84i1", Name: "Radu", Age: 33, Position: "Sapator", Salary: 2300},
			{ID: "u18gr84i8", Name: "Sorin", Age: 35, Position: "Dulgher", Salary: 2200},
			{ID: "u19gr8419", Name: "Tudor", Age: 31, Position: "Zidar", Salary: 2100},
			{ID: "u20gr8i20", Name: "Victor", Age: 40, Position: "Fierar", Salary: 2600},
			{ID: "u21gr4i21", Name: "Alex", Age: 28, Position: "Instalator", Salary: 2300},
			{ID: "u22g84i22", Name: "Cristi", Age: 36, Position: "Sudor", Salary: 2700},
			{ID: "u23r84i23", Name: "Doru", Age: 39, Position: "Vopsitor", Salary: 2500},
			{ID: "u2gr84i24", Name: "Emil", Age: 32, Position: "Tencuitor", Salary: 2400},
			{ID: "u5gr84i25", Name: "Felix", Age: 34, Position: "Sapator", Salary: 2300},
			{ID: "26gr84i26", Name: "Gabi", Age: 41, Position: "Dulgher", Salary: 2200},
			{ID: "u27gr84i2", Name: "Horia", Age: 37, Position: "Zidar", Salary: 2100},
			{ID: "u28gr84i8", Name: "Ionel", Age: 38, Position: "Fierar", Salary: 2600},
			{ID: "u29gr8429", Name: "Julian", Age: 42, Position: "Instalator", Salary: 2300},
			{ID: "u30gr8i30", Name: "Kevin", Age: 30, Position: "Sudor", Salary: 2700},
			{ID: "u31gr4i31", Name: "Leonard", Age: 29, Position: "Vopsitor", Salary: 2500},
			{ID: "u32g84i32", Name: "Mihai", Age: 33, Position: "Tencuitor", Salary: 2400},
			{ID: "u33r84i33", Name: "Nelu", Age: 35, Position: "Sapator", Salary: 2300},
			{ID: "u3gr84i34", Name: "Ovi", Age: 31, Position: "Dulgher", Salary: 2200},
			{ID: "u5gr84i35", Name: "Petre", Age: 40, Position: "Zidar", Salary: 2100},
			{ID: "36gr84i36", Name: "Rares", Age: 28, Position: "Fierar", Salary: 2600},
			{ID: "u37gr84i3", Name: "Sebastian", Age: 36, Position: "Instalator", Salary: 2300},
			{ID: "u38gr84i8", Name: "Teodor", Age: 39, Position: "Sudor", Salary: 2700},
			{ID: "u39gr8439", Name: "Valentin", Age: 32, Position: "Vopsitor", Salary: 2500},
			{ID: "u40gr8i40", Name: "Willy", Age: 34, Position: "Tencuitor", Salary: 2400},
			{ID: "u41gr4i41", Name: "Xavier", Age: 41, Position: "Sapator", Salary: 2300},
			{ID: "u42g84i42", Name: "Yannis", Age: 37, Position: "Dulgher", Salary: 2200},
			{ID: "u43r84i43", Name: "Zoltan", Age: 38, Position: "Zidar", Salary: 2100},
			{ID: "u4gr84i44", Name: "Adrian", Age: 42, Position: "Fierar", Salary: 2600},
			{ID: "u5gr84i45", Name: "Bogdan", Age: 30, Position: "Instalator", Salary: 2300},
			{ID: "46gr84i46", Name: "Cristian", Age: 29, Position: "Sudor", Salary: 2700},
			{ID: "u47gr84i4", Name: "Darius", Age: 33, Position: "Vopsitor", Salary: 2500},
			{ID: "u48gr84i8", Name: "Emanuel", Age: 35, Position: "Tencuitor", Salary: 2400},
			{ID: "u49gr8449", Name: "Fabian", Age: 31, Position: "Sapator", Salary: 2300},
			{ID: "u50gr8i50", Name: "Gabriel", Age: 40, Position: "Dulgher", Salary: 2200},
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
