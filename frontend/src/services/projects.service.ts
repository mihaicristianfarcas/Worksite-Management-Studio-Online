import {
  Project,
  ProjectFilters,
  PaginationParams,
  PaginatedResponse,
  Worker
} from '@/services/types'

// API base URL - make sure this matches backend
const API_URL = 'http://localhost:8080/api'

/**
 * Projects API service
 * Handles all API communication for project-related functionality
 */
export const projectsService = {
  /**
   * Fetch all projects with optional filters and sorting
   */
  async getAll(
    filters?: ProjectFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams()

    if (filters) {
      // Handle search term
      if (filters.search) {
        queryParams.append('search', filters.search)
      }

      // Handle name filter
      if (filters.name) {
        queryParams.append('name', filters.name)
      }

      // Handle status filter
      if (filters.status) {
        queryParams.append('status', filters.status)
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

    const url = `${API_URL}/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch projects: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

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
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  /**
   * Get a project by ID
   */
  async getById(id: number): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error || `Failed to fetch project: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Add a new project
   */
  async create(project: Omit<Project, 'id'>): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to add project'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Update an existing project
   */
  async update(id: number, project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to update project'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Delete a project
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to delete project'
      throw new Error(errorMessage)
    }
  },

  /**
   * Assign a worker to a project
   */
  async assignWorker(projectId: number, workerId: number): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}/workers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workerId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to assign worker to project'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Unassign a worker from a project
   */
  async unassignWorker(projectId: number, workerId: number): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}/workers/${workerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to unassign worker from project'
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  /**
   * Get available workers for a project
   */
  async getAvailableWorkers(projectId: number): Promise<Worker[]> {
    const response = await fetch(`${API_URL}/projects/${projectId}/workers/available`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to get available workers'
      throw new Error(errorMessage)
    }

    return await response.json()
  }
}
