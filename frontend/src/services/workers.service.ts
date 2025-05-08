import { Worker, WorkerFilters, PaginationParams, PaginatedResponse } from '@/services/types'
import { authService } from '@/services/auth.service'

// API base URL
const API_URL = 'http://localhost:8080/api'

/**
 * Workers API service
 * Handles all API communication for worker-related functionality
 */
export const workersService = {
  /**
   * Fetch all workers with optional filters and sorting
   */
  async getAll(
    filters?: WorkerFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Worker>> {
    const queryParams = new URLSearchParams()

    if (filters) {
      // Handle search term
      if (filters.search) {
        queryParams.append('search', filters.search)
      }

      // Handle position filter
      if (filters.position) {
        queryParams.append('position', filters.position)
      }

      // Handle min/max age filters
      if (filters.minAge !== undefined) {
        queryParams.append('min_age', filters.minAge.toString())
      }

      if (filters.maxAge !== undefined) {
        queryParams.append('max_age', filters.maxAge.toString())
      }

      // Handle min/max salary filters
      if (filters.minSalary !== undefined) {
        queryParams.append('min_salary', filters.minSalary.toString())
      }

      if (filters.maxSalary !== undefined) {
        queryParams.append('max_salary', filters.maxSalary.toString())
      }

      // Handle sorting
      if (filters.sortBy) {
        queryParams.append('sort_by', filters.sortBy)
        queryParams.append('sort_order', filters.sortOrder || 'asc')
      }
    }

    // Add pagination parameters
    if (pagination) {
      queryParams.append('page', pagination.page.toString())
      queryParams.append('page_size', pagination.pageSize.toString())
    } else {
      // Default pagination if not provided
      queryParams.append('page', '1')
      queryParams.append('page_size', '10')
    }

    const url = `${API_URL}/workers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    try {
      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeaders()
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch workers: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // Return the paginated response directly since the backend now returns the expected format
      return data
    } catch (error) {
      console.error('Error fetching workers:', error)
      throw error
    }
  },

  /**
   * Get a worker by ID
   */
  async getById(id: number): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      headers: {
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error || `Failed to fetch worker: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Add a new worker
   */
  async create(worker: Omit<Worker, 'id'>): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to add worker'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Update an existing worker
   */
  async update(worker: Worker): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers/${worker.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to update worker'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Delete a worker
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE',
      headers: {
        ...authService.getAuthHeaders()
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to delete worker'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete multiple workers
   */
  async deleteMany(ids: number[]): Promise<void> {
    const response = await fetch(`${API_URL}/workers/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders()
      },
      body: JSON.stringify({ ids })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to delete workers'
      throw new Error(errorMessage)
    }
  }
}
