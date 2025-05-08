import { User } from '@/services/types'
import { authService } from './auth.service'

// API base URL
const API_URL = 'http://localhost:8080/api/admin'

// Activity log type aligned with backend
export type ActivityLog = {
  id: number
  user_id: number
  username: string
  log_type: string
  entity_type: string
  entity_id?: number
  description: string
  created_at: string
}

// Admin service types
export type PaginatedUsersResponse = {
  data: User[]
  total: number
  page: number
  pageSize: number
}

export type UserActivityResponse = {
  user: User
  activity: ActivityLog[]
  total: number
  page: number
  pageSize: number
}

/**
 * Admin service
 * Handles admin-specific operations
 */
export const adminService = {
  /**
   * Get all users with pagination and search
   */
  async getUsers(page = 1, pageSize = 20, search = ''): Promise<PaginatedUsersResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })

    if (search) {
      queryParams.append('search', search)
    }

    const response = await fetch(`${API_URL}/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch users')
    }

    return await response.json()
  },

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(userId: number, active: boolean): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify({ active })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update user status')
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: number, role: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify({ role })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update user role')
    }
  },

  /**
   * Get user activity with pagination
   */
  async getUserActivity(userId: number, page = 1, pageSize = 10): Promise<UserActivityResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })

    const response = await fetch(`${API_URL}/users/${userId}/activity?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch user activity')
    }

    return await response.json()
  }
}
