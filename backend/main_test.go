package main

import (
	"testing"

	"github.com/labstack/echo/v4"
)

func TestEchoSetup(t *testing.T) {
	// Create an Echo instance
	e := echo.New()
	
	// Check that the Echo instance was created successfully
	if e == nil {
		t.Fatal("Failed to create Echo instance")
	}
	
	// Check that Echo has the expected methods
	_, ok := interface{}(e).(interface {
		Start(address string) error
	})
	
	if !ok {
		t.Fatal("Echo instance does not have the expected Start method")
	}
}
