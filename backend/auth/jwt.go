package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/golang-jwt/jwt/v4"
)

// JWTClaims represents the claims in the JWT token
type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// Generate JWT token for a user
func GenerateToken(user *model.User) (string, error) {
	// Get the JWT secret from environment or use a default for development
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key-for-development")
	
	// Set expiration time (24 hours from now)
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// Create claims with user information
	claims := &JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "worksite-management-studio",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}
	
	// Create the token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Generate the signed token string
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}
	
	return tokenString, nil
}

// ValidateToken validates the JWT token and returns the claims
func ValidateToken(tokenString string) (*JWTClaims, error) {
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key-for-development")
	
	// Parse the JWT string and store the result in claims
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})
	
	if err != nil {
		return nil, err
	}
	
	// Check if the token is valid
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	
	return nil, errors.New("invalid token")
}

// Helper function to get environment variables
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
} 