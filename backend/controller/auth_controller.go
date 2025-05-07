package controller

import (
	"net/http"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/auth"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
	"github.com/labstack/echo/v4"
)

type AuthController interface {
	Login(c echo.Context) error
	Register(c echo.Context) error
}

type authController struct {
	userRepo repository.UserRepository
}

func NewAuthController(userRepo repository.UserRepository) AuthController {
	return &authController{
		userRepo: userRepo,
	}
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse represents the login response body
type LoginResponse struct {
	Token    string      `json:"token"`
	User     *model.User `json:"user"`
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Role     string `json:"role" validate:"omitempty,oneof=user admin"`
}

// Login handles user authentication and returns a JWT token
func (c *authController) Login(ctx echo.Context) error {
	var req LoginRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Validate the request
	if req.Username == "" || req.Password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Username and password are required")
	}
	
	// Authenticate the user
	user, err := c.userRepo.ValidateCredentials(req.Username, req.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid credentials")
	}
	
	// Generate JWT token
	token, err := auth.GenerateToken(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate token")
	}
	
	// Update last login timestamp
	now := time.Now()
	user.LastLogin = &now
	c.userRepo.UpdateLastLogin(user.ID)
	
	// Clear sensitive data
	user.PasswordHash = ""
	
	return ctx.JSON(http.StatusOK, LoginResponse{
		Token: token,
		User:  user,
	})
}

// Register handles user registration
func (c *authController) Register(ctx echo.Context) error {
	var req RegisterRequest
	if err := ctx.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body")
	}
	
	// Check if username already exists
	existingUser, err := c.userRepo.GetUserByUsername(req.Username)
	if err == nil && existingUser != nil {
		return echo.NewHTTPError(http.StatusConflict, "Username already taken")
	}
	
	// Check if email already exists
	existingEmail, err := c.userRepo.GetUserByEmail(req.Email)
	if err == nil && existingEmail != nil {
		return echo.NewHTTPError(http.StatusConflict, "Email already registered")
	}
	
	// Set default role if not provided
	if req.Role == "" {
		req.Role = "user"
	}
	
	// Create user object
	user := &model.User{
		Username: req.Username,
		Email:    req.Email,
		Role:     req.Role,
		Active:   true,
	}
	
	// Create the user in the database with hashed password
	if err := c.userRepo.CreateUser(user, req.Password); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create user")
	}
	
	// Generate JWT token
	token, err := auth.GenerateToken(user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate token")
	}
	
	// Set last login timestamp
	now := time.Now()
	user.LastLogin = &now
	c.userRepo.UpdateLastLogin(user.ID)
	
	// Clear sensitive data
	user.PasswordHash = ""
	
	return ctx.JSON(http.StatusCreated, LoginResponse{
		Token: token,
		User:  user,
	})
} 