import { create } from 'zustand'
import { workersApi, Worker } from '@/api/workers'
import { toast } from 'sonner'

interface WorkersState {
  // State
  workers: Worker[]
  isLoading: boolean

  // Actions
  fetchWorkers: () => Promise<Worker[]>
  addWorker: (worker: Worker) => Promise<Worker>
  updateWorker: (worker: Worker) => Promise<Worker>
  deleteWorker: (id: string) => Promise<void>
  deleteWorkers: (ids: string[]) => Promise<void>
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: [],
  isLoading: false,

  fetchWorkers: async () => {
    set({ isLoading: true })
    try {
      const workers = await workersApi.getAll()
      set({ workers })
      return workers
    } catch (error) {
      console.error('Error fetching workers:', error)
      toast.error('Error fetching workers. Please try again.')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  addWorker: async (worker: Worker) => {
    try {
      const newWorker = await workersApi.create(worker)
      set(state => ({ workers: [...state.workers, newWorker] }))
      toast.success('Worker added successfully!')
      return newWorker
    } catch (error) {
      console.error('Error adding worker:', error)
      toast.error('Failed to add worker. Please try again.')
      throw error
    }
  },

  updateWorker: async (worker: Worker) => {
    try {
      const updatedWorker = await workersApi.update(worker)
      set(state => ({
        workers: state.workers.map(w => (w.id === updatedWorker.id ? updatedWorker : w))
      }))
      toast.success('Worker updated successfully!')
      return updatedWorker
    } catch (error) {
      console.error('Error updating worker:', error)
      toast.error('Failed to update worker. Please try again.')
      throw error
    }
  },

  deleteWorker: async (id: string) => {
    try {
      await workersApi.delete(id)
      set(state => ({
        workers: state.workers.filter(w => w.id !== id)
      }))
      toast.success('Worker deleted successfully')
    } catch (error) {
      console.error('Error deleting worker:', error)
      toast.error('Failed to delete worker. Please try again.')
      throw error
    }
  },

  deleteWorkers: async (ids: string[]) => {
    try {
      await workersApi.deleteMany(ids)
      set(state => ({
        workers: state.workers.filter(w => !ids.includes(w.id))
      }))
      toast.success(`${ids.length} workers deleted successfully!`)
    } catch (error) {
      console.error('Error deleting workers:', error)
      toast.error('Failed to delete some workers. Please refresh and try again.')
      // Refresh to sync with backend
      get().fetchWorkers()
      throw error
    }
  }
}))
