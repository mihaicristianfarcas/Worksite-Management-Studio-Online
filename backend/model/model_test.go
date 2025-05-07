package model

import (
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
)

func TestWorkerValidation(t *testing.T) {
	validate := validator.New()

	tests := []struct {
		name    string
		worker  Worker
		wantErr bool
	}{
		{
			name: "valid worker",
			worker: Worker{
				Name:     "John Doe",
				Age:      25,
				Position: "Developer",
				Salary:   50000,
			},
			wantErr: false,
		},
		{
			name: "invalid name too short",
			worker: Worker{
				Name:     "J",
				Age:      25,
				Position: "Developer",
				Salary:   50000,
			},
			wantErr: true,
		},
		{
			name: "invalid age too young",
			worker: Worker{
				Name:     "John Doe",
				Age:      16,
				Position: "Developer",
				Salary:   50000,
			},
			wantErr: true,
		},
		{
			name: "invalid salary negative",
			worker: Worker{
				Name:     "John Doe",
				Age:      25,
				Position: "Developer",
				Salary:   -1000,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validate.Struct(tt.worker)
			if (err != nil) != tt.wantErr {
				t.Errorf("Worker validation error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestProjectValidation(t *testing.T) {
	validate := validator.New()

	tests := []struct {
		name    string
		project Project
		wantErr bool
	}{
		{
			name: "valid project",
			project: Project{
				Name:        "Website Redesign",
				Description: "Complete overhaul of the company website with modern design and improved functionality",
				Status:      "active",
				StartDate:   time.Now(),
			},
			wantErr: false,
		},
		{
			name: "invalid name too short",
			project: Project{
				Name:        "W",
				Description: "Complete overhaul of the company website",
				Status:      "active",
				StartDate:   time.Now(),
			},
			wantErr: true,
		},
		{
			name: "invalid description too short",
			project: Project{
				Name:        "Website Redesign",
				Description: "Too short",
				Status:      "active",
				StartDate:   time.Now(),
			},
			wantErr: true,
		},
		{
			name: "invalid status",
			project: Project{
				Name:        "Website Redesign",
				Description: "Complete overhaul of the company website",
				Status:      "invalid_status",
				StartDate:   time.Now(),
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validate.Struct(tt.project)
			if (err != nil) != tt.wantErr {
				t.Errorf("Project validation error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
} 