package repository

import (
	"errors"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/config"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRepository interface {
	CreateUser(user *model.User, plainPassword string) error
	GetUserByID(id uint) (*model.User, error)
	GetUserByUsername(username string) (*model.User, error)
	GetUserByEmail(email string) (*model.User, error)
	ValidateCredentials(username, password string) (*model.User, error)
	UpdateLastLogin(userID uint) error
	ChangePassword(userID uint, newPassword string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository() UserRepository {
	return &userRepository{
		db: config.DB,
	}
}

// CreateUser creates a new user with hashed password
func (r *userRepository) CreateUser(user *model.User, plainPassword string) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	
	user.PasswordHash = string(hashedPassword)
	
	return r.db.Create(user).Error
}

// GetUserByID retrieves a user by ID
func (r *userRepository) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByUsername retrieves a user by username
func (r *userRepository) GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email
func (r *userRepository) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// ValidateCredentials validates user credentials and returns the user if valid
func (r *userRepository) ValidateCredentials(username, password string) (*model.User, error) {
	user, err := r.GetUserByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}
	
	// Check if user is active
	if !user.Active {
		return nil, errors.New("account is inactive")
	}
	
	// Compare password with hashed password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	
	return user, nil
}

// UpdateLastLogin updates the last login timestamp for a user
func (r *userRepository) UpdateLastLogin(userID uint) error {
	return r.db.Exec("UPDATE users SET last_login = NOW() WHERE id = ?", userID).Error
}

// ChangePassword changes a user's password
func (r *userRepository) ChangePassword(userID uint, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	
	return r.db.Model(&model.User{}).Where("id = ?", userID).
		Update("password_hash", string(hashedPassword)).Error
} 