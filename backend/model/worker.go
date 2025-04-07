package model

type Worker struct {
	ID       string `json:"id" validate:"required"`
	Name     string `json:"name" validate:"required,min=2,max=50"`
	Age      int    `json:"age" validate:"required,min=18,max=100"`
	Position string `json:"position" validate:"required,min=2,max=50"`
	Salary   int    `json:"salary" validate:"required,min=0"`
}