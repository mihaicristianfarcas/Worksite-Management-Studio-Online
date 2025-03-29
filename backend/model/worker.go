package model

type Worker struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Age      int    `json:"age"`
	Position string `json:"position"`
	Salary   int    `json:"salary"`
}