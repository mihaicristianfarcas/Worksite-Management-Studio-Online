package monitoring

import (
	"log"
	"sync"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
)

// SuspiciousActivity represents a detected suspicious activity
type SuspiciousActivity struct {
	UserID       uint      `json:"user_id"`
	Username     string    `json:"username"`
	ActivityType string    `json:"activity_type"`
	Description  string    `json:"description"`
	DetectedAt   time.Time `json:"detected_at"`
	Severity     string    `json:"severity"` // "low", "medium", "high"
}

// ActivityCriteria defines a rule to detect suspicious activity
type ActivityCriteria struct {
	Name        string
	Description string
	Severity    string
	Check       func(logs []model.ActivityLog, user model.User) (bool, string)
}

// ActivityMonitor handles background monitoring of user activities
type ActivityMonitor struct {
	logRepo            *repository.LogRepository
	userRepo           repository.UserRepository
	monitoredUsers     map[uint]bool
	suspiciousActivity chan SuspiciousActivity
	mutex              sync.RWMutex
	criteria           []ActivityCriteria
	isRunning          bool
	stopChan           chan struct{}
}

// NewActivityMonitor creates a new instance of ActivityMonitor
func NewActivityMonitor(logRepo *repository.LogRepository, userRepo repository.UserRepository) *ActivityMonitor {
	return &ActivityMonitor{
		logRepo:            logRepo,
		userRepo:           userRepo,
		monitoredUsers:     make(map[uint]bool),
		suspiciousActivity: make(chan SuspiciousActivity, 100),
		criteria:           defaultCriteria(),
		isRunning:          false,
		stopChan:           make(chan struct{}),
	}
}

// Start begins the background monitoring process
func (am *ActivityMonitor) Start() {
	am.mutex.Lock()
	if am.isRunning {
		am.mutex.Unlock()
		return
	}
	am.isRunning = true
	am.mutex.Unlock()

	log.Println("Starting activity monitoring thread")

	// Start the monitoring goroutine
	go am.monitorRoutine()
}

// Stop halts the background monitoring process
func (am *ActivityMonitor) Stop() {
	am.mutex.Lock()
	defer am.mutex.Unlock()
	
	if !am.isRunning {
		return
	}
	
	am.isRunning = false
	am.stopChan <- struct{}{}
	log.Println("Stopped activity monitoring thread")
}

// AddToMonitored adds a user to the monitored list
func (am *ActivityMonitor) AddToMonitored(userID uint) {
	am.mutex.Lock()
	defer am.mutex.Unlock()
	am.monitoredUsers[userID] = true
}

// RemoveFromMonitored removes a user from the monitored list
func (am *ActivityMonitor) RemoveFromMonitored(userID uint) {
	am.mutex.Lock()
	defer am.mutex.Unlock()
	delete(am.monitoredUsers, userID)
}

// IsMonitored checks if a user is being monitored
func (am *ActivityMonitor) IsMonitored(userID uint) bool {
	am.mutex.RLock()
	defer am.mutex.RUnlock()
	return am.monitoredUsers[userID]
}

// GetMonitoredUsers returns the list of all monitored user IDs
func (am *ActivityMonitor) GetMonitoredUsers() []uint {
	am.mutex.RLock()
	defer am.mutex.RUnlock()
	
	userIDs := make([]uint, 0, len(am.monitoredUsers))
	for userID := range am.monitoredUsers {
		userIDs = append(userIDs, userID)
	}
	
	return userIDs
}

// Subscribe returns a channel that will receive suspicious activity alerts
func (am *ActivityMonitor) Subscribe() <-chan SuspiciousActivity {
	return am.suspiciousActivity
}

// monitorRoutine is the main loop that performs the monitoring
func (am *ActivityMonitor) monitorRoutine() {
	ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			am.checkAllUsers()
		case <-am.stopChan:
			return
		}
	}
}

// checkAllUsers processes all user activity for suspicious patterns
func (am *ActivityMonitor) checkAllUsers() {
	// Get all users
	users, _, err := am.userRepo.GetAllUsers(1, 1000, "") // Assuming we won't have more than 1000 users
	if err != nil {
		log.Printf("Error fetching users for monitoring: %v", err)
		return
	}

	// Check each user for suspicious activity
	for _, user := range users {
		// Skip inactive users
		if !user.Active {
			continue
		}

		// For admin users, we might want different monitoring rules or skip them entirely
		// For now, we monitor everyone
		
		// Get recent logs for this user (last 24 hours)
		now := time.Now()
		startDate := now.Add(-24 * time.Hour).Format("2006-01-02 15:04:05")
		endDate := now.Format("2006-01-02 15:04:05")
		
		logs, _, err := am.logRepo.GetLogsByDateRange(startDate, endDate, 1, 1000)
		if err != nil {
			log.Printf("Error fetching logs for user %d: %v", user.ID, err)
			continue
		}
		
		// Filter logs for this user
		userLogs := make([]model.ActivityLog, 0)
		for _, log := range logs {
			if log.UserID == user.ID {
				userLogs = append(userLogs, log)
			}
		}
		
		// Apply each criteria to the user's logs
		for _, criteria := range am.criteria {
			suspicious, description := criteria.Check(userLogs, user)
			if suspicious {
				// Report suspicious activity
				activity := SuspiciousActivity{
					UserID:       user.ID,
					Username:     user.Username,
					ActivityType: criteria.Name,
					Description:  description,
					DetectedAt:   time.Now(),
					Severity:     criteria.Severity,
				}
				
				// Add user to monitored list
				am.AddToMonitored(user.ID)
				
				// Send alert to subscribers
				select {
				case am.suspiciousActivity <- activity:
					// Successfully sent alert
				default:
					// Channel buffer is full, log this to prevent blocking
					log.Printf("Alert buffer full, dropping alert for user %d", user.ID)
				}
			}
		}
	}
}

// defaultCriteria returns the default set of suspicious activity detection rules
func defaultCriteria() []ActivityCriteria {
	return []ActivityCriteria{
		{
			Name:        "rapid-login-attempts",
			Description: "Multiple login attempts in a short time period",
			Severity:    "medium",
			Check: func(logs []model.ActivityLog, user model.User) (bool, string) {
				loginCount := 0
				for _, log := range logs {
					if log.LogType == model.LogTypeLogin && time.Since(log.CreatedAt) < 1*time.Hour {
						loginCount++
					}
				}
				
				if loginCount >= 5 {
					return true, "5 or more login attempts within the last hour"
				}
				return false, ""
			},
		},
		{
			Name:        "unusual-access-time",
			Description: "Access outside normal working hours",
			Severity:    "low",
			Check: func(logs []model.ActivityLog, user model.User) (bool, string) {
				for _, log := range logs {
					hour := log.CreatedAt.Hour()
					// Assuming normal working hours are 8 AM to 6 PM
					if hour < 8 || hour > 18 {
						// Check if it's recent (last hour)
						if time.Since(log.CreatedAt) < 1*time.Hour {
							return true, "Activity detected outside normal working hours"
						}
					}
				}
				return false, ""
			},
		},
		{
			Name:        "mass-data-modification",
			Description: "Large number of update or delete operations",
			Severity:    "high",
			Check: func(logs []model.ActivityLog, user model.User) (bool, string) {
				modCount := 0
				for _, log := range logs {
					if (log.LogType == model.LogTypeUpdate || log.LogType == model.LogTypeDelete) && 
					   time.Since(log.CreatedAt) < 15*time.Minute {
						modCount++
					}
				}
				
				if modCount >= 20 {
					return true, "20 or more update/delete operations within 15 minutes"
				}
				return false, ""
			},
		},
		{
			Name:        "sensitive-data-access",
			Description: "Repeated access to sensitive user data",
			Severity:    "high",
			Check: func(logs []model.ActivityLog, user model.User) (bool, string) {
				userDataAccessCount := 0
				for _, log := range logs {
					if log.EntityType == model.EntityTypeUser && 
					   log.LogType == model.LogTypeRead && 
					   time.Since(log.CreatedAt) < 10*time.Minute {
						userDataAccessCount++
					}
				}
				
				if userDataAccessCount >= 10 && user.Role != "admin" {
					return true, "Frequent access to user data by non-admin"
				}
				return false, ""
			},
		},
	}
} 