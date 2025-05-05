import { create } from 'zustand'
import { Project, ProjectFilters, ProjectsAPI } from '@/api/projects-api'

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
  lastFetchTime: number | null
  fetchProjects: (filters?: ProjectFilters, page?: number, pageSize?: number) => Promise<void>
  setFilters: (filters: ProjectFilters) => void
  addProject: (project: Project) => Promise<void>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  deleteProjects: (ids: string[]) => Promise<void>
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
  lastFetchTime: null,

  fetchProjects: async (filters = {}, page = 1, pageSize = 10) => {
    const state = get()
    const currentTime = Date.now()
    const cacheTime = 5000 // 5 seconds cache

    // Check if we have cached data that's still valid
    if (
      state.lastFetchTime &&
      currentTime - state.lastFetchTime < cacheTime &&
      state.projects.length > 0
    ) {
      return
    }

    set({ loadingState: 'loading', error: null })

    try {
      const response = await ProjectsAPI.getAll(filters, { page, pageSize })
      set({
        projects: response.data,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total
        },
        loadingState: 'idle',
        lastFetchTime: currentTime
      })
    } catch (error) {
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      })
    }
  },

  setFilters: (filters: ProjectFilters) => {
    set({ filters })
  },

  addProject: async (project: Project) => {
    set({ loadingState: 'loading', error: null })

    try {
      await ProjectsAPI.create(project)
      const state = get()
      await state.fetchProjects(state.filters, state.pagination.page, state.pagination.pageSize)
    } catch (error) {
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to add project'
      })
      throw error
    }
  },

  updateProject: async (project: Project) => {
    set({ loadingState: 'loading', error: null })

    try {
      await ProjectsAPI.update(project)
      const state = get()
      await state.fetchProjects(state.filters, state.pagination.page, state.pagination.pageSize)
    } catch (error) {
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to update project'
      })
      throw error
    }
  },

  deleteProject: async (id: string) => {
    set({ loadingState: 'loading', error: null })

    try {
      await ProjectsAPI.delete(id)
      const state = get()
      await state.fetchProjects(state.filters, state.pagination.page, state.pagination.pageSize)
    } catch (error) {
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to delete project'
      })
      throw error
    }
  },

  deleteProjects: async (ids: string[]) => {
    set({ loadingState: 'loading', error: null })

    try {
      await ProjectsAPI.deleteMany(ids)
      const state = get()
      await state.fetchProjects(state.filters, state.pagination.page, state.pagination.pageSize)
    } catch (error) {
      set({
        loadingState: 'error',
        error: error instanceof Error ? error.message : 'Failed to delete projects'
      })
      throw error
    }
  }
}))
