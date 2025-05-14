import { User } from '@/services/types'

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Define login request type
export type LoginRequest = {
  username: string
  password: string
}

// Define register request type
export type RegisterRequest = {
  username: string
  email: string
  password: string
  role?: string
}

// Define auth response type
export type AuthResponse = {
  token: string
  user: User
}

// Local storage keys
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Authentication service
 * Handles login, registration, and token management
 */
export const authService = {
  /**
   * Login user with username and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()

    // Store token and user in local storage
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))

    return data
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Registration failed')
    }

    const data = await response.json()

    // Store token and user in local storage
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))

    return data
  },

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get the current authenticated user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.logout()
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
