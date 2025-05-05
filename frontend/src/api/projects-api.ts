// Type definitions and API service for projects
export type Project = {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string
  end_date?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  workers?: Worker[]
}

export type Worker = {
  id: string
  name: string
  age: number
  position: string
  salary: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  projects?: Project[]
}

export type ProjectFilters = {
  name?: string
  status?: string
  search?: string
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

// Projects API service
export const ProjectsAPI = {
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

  // Add a new project
  async create(project: Project): Promise<Project> {
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
  async update(project: Project): Promise<Project> {
    console.log('Updating project:', project)
    const response = await fetch(`${API_URL}/projects/${project.id}`, {
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
  async delete(id: string): Promise<void> {
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

  // Delete multiple projects
  async deleteMany(ids: string[]): Promise<void> {
    console.log('Deleting multiple projects:', ids)
    // Create a promise for each delete operation
    const deletePromises = ids.map(async id => {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete project ${id}`)
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
      const errorMessage = `Failed to delete ${failures.length} projects: ${failures
        .map(f => f?.error.message)
        .join(', ')}`
      console.error('Error deleting multiple projects:', errorMessage)
      throw new Error(errorMessage)
    }
    console.log('Multiple projects deleted successfully')
  }
}
