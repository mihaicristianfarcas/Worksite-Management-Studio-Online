import { Project, ProjectFilters, PaginationParams, PaginatedResponse } from './types'
import { Worker } from './types'

// API base URL - make sure this matches backend
const API_URL = 'http://localhost:8080/api'

// Projects API service
export const projectApi = {
  // Fetch all projects with optional filters and sorting
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
    console.log('Fetching projects from:', url)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `Failed to fetch projects: ${response.status} ${response.statusText}`
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
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  // Get a project by ID
  async getById(id: number): Promise<Project> {
    console.log('Fetching project with ID:', id)
    const response = await fetch(`${API_URL}/projects/${id}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error || `Failed to fetch project: ${response.status} ${response.statusText}`
      console.error('Error fetching project:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Project retrieved:', data)
    return data
  },

  // Add a new project
  async create(project: Omit<Project, 'id'>): Promise<Project> {
    console.log('Creating project:', project)
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
      console.error('Error creating project:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Project created:', data)
    return data
  },

  // Update an existing project
  async update(id: number, project: Partial<Project>): Promise<Project> {
    console.log('Updating project with ID:', id, 'Changes:', project)
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
      console.error('Error updating project:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Project updated:', data)
    return data
  },

  // Delete a project
  async delete(id: number): Promise<void> {
    console.log('Deleting project:', id)
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to delete project'
      console.error('Error deleting project:', errorMessage)
      throw new Error(errorMessage)
    }
    console.log('Project deleted successfully')
  },

  // Assign a worker to a project
  async assignWorker(projectId: number, workerId: number): Promise<Project> {
    console.log('Assigning worker', workerId, 'to project', projectId)
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
      console.error('Error assigning worker:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Worker assigned to project:', data)
    return data
  },

  // Unassign a worker from a project
  async unassignWorker(projectId: number, workerId: number): Promise<Project> {
    console.log('Unassigning worker', workerId, 'from project', projectId)
    const response = await fetch(`${API_URL}/projects/${projectId}/workers/${workerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to unassign worker from project'
      console.error('Error unassigning worker:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Worker unassigned from project:', data)
    return data
  },

  // Get available workers for a project
  async getAvailableWorkers(projectId: number): Promise<Worker[]> {
    console.log('Getting available workers for project', projectId)
    const response = await fetch(`${API_URL}/projects/${projectId}/workers/available`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || 'Failed to get available workers'
      console.error('Error getting available workers:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Available workers:', data)
    return data
  }
}
