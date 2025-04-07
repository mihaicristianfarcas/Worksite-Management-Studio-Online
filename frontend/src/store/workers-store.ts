import { create } from 'zustand'
import { WorkersAPI, Worker, WorkerFilters } from '@/api/workers-api'
import { toast } from 'sonner'

// Enhanced loading state type
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

interface WorkersState {
  // State
  workers: Worker[]
  loadingState: LoadingState
  error: string | null
  filters: WorkerFilters
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  lastFetchTime: number | null
  cacheTimeout: number // milliseconds

  // Actions
  fetchWorkers: (filters?: WorkerFilters, page?: number, pageSize?: number) => Promise<Worker[]>
  setFilters: (filters: WorkerFilters) => void
  addWorker: (worker: Worker) => Promise<Worker>
  updateWorker: (worker: Worker) => Promise<Worker>
  deleteWorker: (id: string) => Promise<void>
  deleteWorkers: (ids: string[]) => Promise<void>
  resetError: () => void
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: [],
  loadingState: 'idle',
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },
  lastFetchTime: null,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes cache

  setFilters: (filters: WorkerFilters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } })
  },

  resetError: () => {
    set({ error: null })
  },

  fetchWorkers: async (filters?: WorkerFilters, page?: number, pageSize?: number) => {
    const currentState = get()
    const currentTime = Date.now()

    // Check if we have cached data that's still valid
    if (
      currentState.lastFetchTime &&
      currentTime - currentState.lastFetchTime < currentState.cacheTimeout &&
      currentState.loadingState === 'success' &&
      JSON.stringify(currentState.filters) === JSON.stringify(filters || {}) &&
      currentState.pagination.page === (page || currentState.pagination.page) &&
      currentState.pagination.pageSize === (pageSize || currentState.pagination.pageSize)
    ) {
      return currentState.workers
    }

    set({ loadingState: 'loading', error: null })
    console.log('Fetching workers with filters:', filters)

    try {
      const paginationParams = {
        page: page || currentState.pagination.page,
        pageSize: pageSize || currentState.pagination.pageSize
      }

      console.log('Fetching with pagination:', paginationParams)
      const result = await WorkersAPI.getAll(filters, paginationParams)
      console.log('API result:', result)

      set({
        workers: result.data,
        loadingState: 'success',
        filters: filters || {},
        pagination: {
          page: paginationParams.page,
          pageSize: paginationParams.pageSize,
          total: result.total
        },
        lastFetchTime: currentTime
      })

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error fetching workers:', error)
      set({
        loadingState: 'error',
        error: errorMessage
      })
      toast.error(`Error fetching workers: ${errorMessage}`)
      throw error
    }
  },

  addWorker: async (worker: Worker) => {
    set({ loadingState: 'loading', error: null })
    try {
      const newWorker = await WorkersAPI.create(worker)
      set(state => ({
        workers: [...state.workers, newWorker],
        loadingState: 'success'
      }))
      toast.success('Worker added successfully!')
      return newWorker
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error adding worker:', error)
      set({
        loadingState: 'error',
        error: errorMessage
      })
      toast.error(`Failed to add worker: ${errorMessage}`)
      throw error
    }
  },

  updateWorker: async (worker: Worker) => {
    set({ loadingState: 'loading', error: null })
    try {
      const updatedWorker = await WorkersAPI.update(worker)
      set(state => ({
        workers: state.workers.map(w => (w.id === updatedWorker.id ? updatedWorker : w)),
        loadingState: 'success'
      }))
      toast.success('Worker updated successfully!')
      return updatedWorker
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error updating worker:', error)
      set({
        loadingState: 'error',
        error: errorMessage
      })
      toast.error(`Failed to update worker: ${errorMessage}`)
      throw error
    }
  },

  deleteWorker: async (id: string) => {
    set({ loadingState: 'loading', error: null })
    try {
      await WorkersAPI.delete(id)
      set(state => ({
        workers: state.workers.filter(w => w.id !== id),
        loadingState: 'success'
      }))
      toast.success('Worker deleted successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error deleting worker:', error)
      set({
        loadingState: 'error',
        error: errorMessage
      })
      toast.error(`Failed to delete worker: ${errorMessage}`)
      throw error
    }
  },

  deleteWorkers: async (ids: string[]) => {
    set({ loadingState: 'loading', error: null })
    try {
      await WorkersAPI.deleteMany(ids)
      set(state => ({
        workers: state.workers.filter(w => !ids.includes(w.id)),
        loadingState: 'success'
      }))
      toast.success(`${ids.length} workers deleted successfully!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error deleting workers:', error)
      set({
        loadingState: 'error',
        error: errorMessage
      })
      toast.error(`Failed to delete some workers: ${errorMessage}`)
      // Refresh to sync with backend
      get().fetchWorkers(get().filters, get().pagination.page, get().pagination.pageSize)
      throw error
    }
  }
}))
