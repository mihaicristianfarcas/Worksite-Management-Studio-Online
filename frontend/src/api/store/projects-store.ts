import { create } from 'zustand'
import { Worker } from '@/api/model/worker'
import { Project, ProjectFilters } from '@/api/model/project'
import { projectsService } from '@/api/services/projects.service'

interface ProjectsState {
  projects: Project[]
  loadingState: 'idle' | 'loading' | 'error'
  error: string | null
  filters: ProjectFilters
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  fetchProjects: (filters?: ProjectFilters, page?: number, pageSize?: number) => Promise<Project[]>
  refreshProjects: () => Promise<Project[]>
  setFilters: (filters: ProjectFilters) => void
  addProject: (project: Project) => Promise<void>
  updateProject: (project: Project) => Promise<Project>
  deleteProject: (id: number) => Promise<void>
  assignWorker: (projectId: number, workerId: number) => Promise<Project>
  unassignWorker: (projectId: number, workerId: number) => Promise<Project>
  getAvailableWorkers: (projectId: number) => Promise<Worker[]>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loadingState: 'idle',
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },

  fetchProjects: async (filters = {}, page = 1, pageSize = 10) => {
    console.log('Fetching projects with filters:', filters, 'page:', page, 'pageSize:', pageSize)
    set({ loadingState: 'loading', error: null })

    try {
      const response = await projectsService.getAll(filters, { page, pageSize })
      console.log('Projects fetched successfully:', response)
      set({
        projects: response.data,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total
        },
        loadingState: 'idle',
        filters // Store the current filters
      })
      return response.data
    } catch (error) {
      console.error('Error fetching projects:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      })
      throw error
    }
  },

  refreshProjects: async () => {
    const { filters, pagination } = get()
    return await get().fetchProjects(filters, pagination.page, pagination.pageSize)
  },

  setFilters: (filters: ProjectFilters) => {
    console.log('Setting project filters:', filters)
    set({ filters })
  },

  addProject: async (project: Project) => {
    console.log('Adding new project:', project)
    set({ loadingState: 'loading', error: null })

    try {
      await projectsService.create(project)
      await get().refreshProjects()
    } catch (error) {
      console.error('Error adding project:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to add project'
      })
      throw error
    }
  },

  updateProject: async (project: Project) => {
    console.log('Updating project:', project)
    set({ loadingState: 'loading', error: null })

    try {
      const updatedProject = await projectsService.update(project.id, project)
      await get().refreshProjects()
      return updatedProject
    } catch (error) {
      console.error('Error updating project:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to update project'
      })
      throw error
    }
  },

  deleteProject: async (id: number) => {
    console.log('Deleting project:', id)
    set({ loadingState: 'loading', error: null })

    try {
      await projectsService.delete(id)
      await get().refreshProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to delete project'
      })
      throw error
    }
  },

  assignWorker: async (projectId: number, workerId: number) => {
    console.log('Assigning worker', workerId, 'to project', projectId)
    set({ loadingState: 'loading', error: null })

    try {
      const updatedProject = await projectsService.assignWorker(projectId, workerId)
      set(state => ({
        projects: state.projects.map(p => (p.id === projectId ? updatedProject : p)),
        loadingState: 'idle'
      }))
      return updatedProject
    } catch (error) {
      console.error('Error assigning worker:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to assign worker'
      })
      throw error
    }
  },

  unassignWorker: async (projectId: number, workerId: number) => {
    console.log('Unassigning worker', workerId, 'from project', projectId)
    set({ loadingState: 'loading', error: null })

    try {
      const updatedProject = await projectsService.unassignWorker(projectId, workerId)
      set(state => ({
        projects: state.projects.map(p => (p.id === projectId ? updatedProject : p)),
        loadingState: 'idle'
      }))
      return updatedProject
    } catch (error) {
      console.error('Error unassigning worker:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to unassign worker'
      })
      throw error
    }
  },

  getAvailableWorkers: async (projectId: number): Promise<Worker[]> => {
    console.log('Getting available workers for project', projectId)
    set({ loadingState: 'loading', error: null })

    try {
      const response = await projectsService.getAvailableWorkers(projectId)
      set({ loadingState: 'idle' })
      // Extract workers array from paginated response
      return response.data
    } catch (error) {
      console.error('Error getting available workers:', error)
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to get available workers'
      })
      throw error
    }
  }
}))
