package monitoring

import (
	"log"
	"time"

	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/model"
	"github.com/Forquosh/Worksite-Management-Studio-Online/backend/repository"
)

// AlertMessage is the structure sent to WebSocket clients
type AlertMessage struct {
	Type            string            `json:"type"`
	SuspiciousActivity SuspiciousActivity `json:"activity"`
	Timestamp       time.Time         `json:"timestamp"`
}

// MonitoringService connects the ActivityMonitor with WebSocket and repository
type MonitoringService struct {
	activityMonitor   *ActivityMonitor
	webSocketHub      *WebSocketHub
	monitoredUserRepo *repository.MonitoredUserRepository
	userRepo          repository.UserRepository
}

// NewMonitoringService creates a new monitoring service
func NewMonitoringService(
	monitoredUserRepo *repository.MonitoredUserRepository,
	userRepo repository.UserRepository,
) *MonitoringService {
	// Create components
	activityMonitor := NewActivityMonitor(repository.NewLogRepository(), userRepo)
	webSocketHub := NewWebSocketHub()

	service := &MonitoringService{
		activityMonitor:   activityMonitor,
		webSocketHub:      webSocketHub,
		monitoredUserRepo: monitoredUserRepo,
		userRepo:          userRepo,
	}

	// Start WebSocket hub
	go webSocketHub.Run()

	// Set up subscription to alerts
	go service.handleAlerts()

	// Start activity monitor
	activityMonitor.Start()

	return service
}

// handleAlerts processes suspicious activity alerts
func (s *MonitoringService) handleAlerts() {
	// Subscribe to the activity monitor for alerts
	alertChannel := s.activityMonitor.Subscribe()

	for activity := range alertChannel {
		// Record the alert in the database
		s.recordAlert(activity)

		// Broadcast to WebSocket clients
		s.broadcastAlert(activity)
	}
}

// recordAlert stores the alert in the database
func (s *MonitoringService) recordAlert(activity SuspiciousActivity) {
	// Check if the user is already being monitored
	_, err := s.monitoredUserRepo.GetMonitoredUserByUserID(activity.UserID)
	
	if err == nil {
		// User is already monitored, update alert count
		if err := s.monitoredUserRepo.RecordAlert(activity.UserID); err != nil {
			log.Printf("Error updating alert count for user %d: %v", activity.UserID, err)
		}
	} else {
		// User is not monitored yet, create a new monitored user entry
		newUser := &model.MonitoredUser{
			UserID:          activity.UserID,
			Username:        activity.Username,
			Reason:          activity.Description,
			Severity:        activity.Severity,
			FirstDetectedAt: activity.DetectedAt,
			LastAlertAt:     activity.DetectedAt,
			AlertCount:      1,
			Notes:           activity.ActivityType,
		}
		
		if err := s.monitoredUserRepo.CreateMonitoredUser(newUser); err != nil {
			log.Printf("Error creating monitored user for %d: %v", activity.UserID, err)
		}
	}
}

// broadcastAlert sends the alert to all connected WebSocket clients
func (s *MonitoringService) broadcastAlert(activity SuspiciousActivity) {
	alert := AlertMessage{
		Type:              "suspicious_activity",
		SuspiciousActivity: activity,
		Timestamp:         time.Now(),
	}
	
	s.webSocketHub.Broadcast(alert)
}

// GetActivityMonitor returns the ActivityMonitor instance
func (s *MonitoringService) GetActivityMonitor() *ActivityMonitor {
	return s.activityMonitor
}

// GetWebSocketHub returns the WebSocketHub instance
func (s *MonitoringService) GetWebSocketHub() *WebSocketHub {
	return s.webSocketHub
}

// Shutdown stops all monitoring components
func (s *MonitoringService) Shutdown() {
	s.activityMonitor.Stop()
} 