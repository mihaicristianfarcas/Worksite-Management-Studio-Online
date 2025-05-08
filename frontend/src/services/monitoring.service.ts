import { authService } from './auth.service'

// API base URL
const API_URL = 'http://localhost:8080/api/monitoring'

// Monitoring service types
export type SuspiciousActivity = {
  user_id: number
  username: string
  activity_type: string
  description: string
  detected_at: string
  severity: 'low' | 'medium' | 'high'
}

export type AlertMessage = {
  type: string
  activity: SuspiciousActivity
  timestamp: string
}

export type MonitoredUser = {
  id: number
  user_id: number
  username: string
  reason: string
  severity: 'low' | 'medium' | 'high'
  added_by: number
  added_by_name: string
  first_detected_at: string
  last_alert_at: string
  alert_count: number
  notes: string
  created_at: string
  updated_at: string
}

export type PaginatedMonitoredUsersResponse = {
  data: MonitoredUser[]
  total: number
  page: number
  pageSize: number
}

/**
 * Monitoring service
 * Handles monitoring-specific operations
 */
export const monitoringService = {
  /**
   * Get all monitored users with pagination
   */
  async getMonitoredUsers(page = 1, pageSize = 20): Promise<PaginatedMonitoredUsersResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })

    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch monitored users')
    }

    return await response.json()
  },

  /**
   * Add a user to the monitored list
   */
  async addToMonitored(
    userId: number,
    reason: string,
    notes = '',
    severity = 'medium'
  ): Promise<MonitoredUser> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify({ user_id: userId, reason, notes, severity })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to add user to monitored list')
    }

    return await response.json()
  },

  /**
   * Update a monitored user
   */
  async updateMonitoredUser(
    userId: number,
    updates: { notes?: string; severity?: string }
  ): Promise<MonitoredUser> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update monitored user')
    }

    return await response.json()
  },

  /**
   * Remove a user from the monitored list
   */
  async removeFromMonitored(userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to remove user from monitored list')
    }
  },

  /**
   * Get recent alerts
   */
  async getRecentAlerts(hours = 24): Promise<MonitoredUser[]> {
    const queryParams = new URLSearchParams({
      hours: hours.toString()
    })

    const response = await fetch(`${API_URL}/alerts?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch recent alerts')
    }

    return await response.json()
  },

  /**
   * Create a WebSocket connection for real-time monitoring
   */
  createWebSocketConnection(): WebSocket {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const ws = new WebSocket(`ws://localhost:8080/ws/monitoring?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connection established')
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    return ws
  }
}
