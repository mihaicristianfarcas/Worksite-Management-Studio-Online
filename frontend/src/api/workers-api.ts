// Type definitions and API service for workers
import { Worker, WorkerFilters, PaginationParams, PaginatedResponse } from './types'

// API base URL - make sure this matches backend
const API_URL = 'http://localhost:8080/api'

// Workers API service
export const WorkersAPI = {
  // Fetch all workers with optional filters and sorting
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

      // Handle age range filters
      if (filters.minAge) {
        queryParams.append('min_age', filters.minAge.toString())
      }
      if (filters.maxAge) {
        queryParams.append('max_age', filters.maxAge.toString())
      }

      // Handle salary range filters
      if (filters.minSalary) {
        queryParams.append('min_salary', filters.minSalary.toString())
      }
      if (filters.maxSalary) {
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
    console.log('Fetching workers from:', url)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch workers: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      console.log('API response:', data)

      // Check if the response is already in the expected format
      if (data.data && typeof data.total === 'number') {
        return data
      }

      // If it's an array, convert it to the expected format
      if (Array.isArray(data)) {
        return {
          data: data,
          total: data.length,
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || data.length
        }
      }

      throw new Error('Invalid response format from server')
    } catch (error) {
      console.error('Error fetching workers:', error)
      throw error
    }
  },

  // Add a new worker
  async create(worker: Worker): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to add worker'
      throw new Error(errorMessage)
    }

    return response.json()
  },

  // Update an existing worker
  async update(worker: Worker): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers/${worker.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to update worker'
      throw new Error(errorMessage)
    }

    return response.json()
  },

  // Delete a worker
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to delete worker'
      throw new Error(errorMessage)
    }
  },

  // Delete multiple workers
  async deleteMany(ids: number[]): Promise<void> {
    // Create a promise for each delete operation
    const deletePromises = ids.map(async id => {
      const response = await fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete worker ${id}`)
      }
    })

    // Wait for all delete operations to complete
    const results = await Promise.allSettled(deletePromises)

    // Check if any operations failed
    const failures = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          return { id: ids[index], error: (result as PromiseRejectedResult).reason }
        }
        return null
      })
      .filter(Boolean)

    if (failures.length > 0) {
      throw new Error(
        `Failed to delete ${failures.length} workers: ${failures
          .map(f => f?.error.message)
          .join(', ')}`
      )
    }
  }
}
