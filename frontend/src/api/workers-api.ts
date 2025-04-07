// Type definitions and API service for workers
export type Worker = {
  id: string
  name: string
  age: number
  position: string
  salary: number
}

export type WorkerFilters = {
  position?: string
  minAge?: number
  maxAge?: number
  minSalary?: number
  maxSalary?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PaginationParams = {
  page: number
  pageSize: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

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
      if (filters.position) queryParams.append('position', filters.position)
      if (filters.minAge) queryParams.append('min_age', filters.minAge.toString())
      if (filters.maxAge) queryParams.append('max_age', filters.maxAge.toString())
      if (filters.minSalary) queryParams.append('min_salary', filters.minSalary.toString())
      if (filters.maxSalary) queryParams.append('max_salary', filters.maxSalary.toString())
      if (filters.sortBy) queryParams.append('sort_by', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder)
    }

    // Add pagination parameters
    if (pagination) {
      queryParams.append('page', pagination.page.toString())
      queryParams.append('pageSize', pagination.pageSize.toString())
    } else {
      // Default pagination if not provided
      queryParams.append('page', '1')
      queryParams.append('pageSize', '10')
    }

    const url = `${API_URL}/workers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    console.log('Fetching workers from:', url)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch workers: ${response.status} ${response.statusText}`)
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

      throw new Error('No results.')
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
      throw new Error('Failed to add worker')
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
      throw new Error('Failed to update worker')
    }

    return response.json()
  },

  // Delete a worker
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete worker')
    }
  },

  // Delete multiple workers
  async deleteMany(ids: string[]): Promise<void> {
    // Create a promise for each delete operation
    const deletePromises = ids.map(id =>
      fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE'
      })
    )

    // Wait for all delete operations to complete
    const results = await Promise.allSettled(deletePromises)

    // Check if any operations failed
    const failedCount = results.filter(result => result.status === 'rejected').length

    if (failedCount > 0) {
      throw new Error(`Failed to delete ${failedCount} workers`)
    }
  }
}
