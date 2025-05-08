package monitoring

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// WebSocketHub manages WebSocket connections
type WebSocketHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan interface{}
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.Mutex
}

// NewWebSocketHub creates a new WebSocket hub
func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan interface{}, 10),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

// Run starts the WebSocket hub
func (h *WebSocketHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Println("New WebSocket client connected")
		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mutex.Unlock()
			log.Println("WebSocket client disconnected")
		case message := <-h.broadcast:
			h.mutex.Lock()
			for client := range h.clients {
				messageJSON, err := json.Marshal(message)
				if err != nil {
					log.Printf("Error marshaling message: %v", err)
					continue
				}
				
				if err := client.WriteMessage(websocket.TextMessage, messageJSON); err != nil {
					log.Printf("Error writing to WebSocket: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mutex.Unlock()
		}
	}
}

// Broadcast sends a message to all connected clients
func (h *WebSocketHub) Broadcast(message interface{}) {
	h.broadcast <- message
}

// HandleWebSocket handles WebSocket connections
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// In production, should check the origin
		return true
	},
}

// HandleWebSocketConnection handles a new WebSocket connection
func (h *WebSocketHub) HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading to WebSocket: %v", err)
		return
	}
	
	// Register the new client
	h.register <- conn
	
	// Handle client disconnection
	go func() {
		for {
			// Read from WebSocket to detect disconnections
			if _, _, err := conn.ReadMessage(); err != nil {
				h.unregister <- conn
				break
			}
		}
	}()
} 