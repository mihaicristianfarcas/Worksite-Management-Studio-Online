import * as React from 'react'
import { SortingState } from '@tanstack/react-table'
import { Worker, WorkerFilters } from '@/api/types'
import { useWorkersStore } from '@/store/workers-store'

export interface UseWorkersTableProps {
  initialFilters?: WorkerFilters
}

export interface UseWorkersTableReturn {
  // Table state
  workers: Worker[]
  loadingState: 'idle' | 'loading' | 'success' | 'error'
  pagination: {
    page: number
    pageSize: number
    total: number
  }

  // Table UI state
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  columnVisibility: Record<string, boolean>
  setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  rowSelection: Record<string, boolean>
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  globalFilter: string
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>

  // Filter state
  filters: WorkerFilters
  tempFilters: WorkerFilters
  searchTerm: string

  // UI state
  addDialogOpen: boolean
  setAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedWorker: Worker | null
  setSelectedWorker: React.Dispatch<React.SetStateAction<Worker | null>>
  deleteConfirmOpen: boolean
  setDeleteConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>
  deleteMultipleConfirmOpen: boolean
  setDeleteMultipleConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>
  workerToDelete: Worker | null
  setWorkerToDelete: React.Dispatch<React.SetStateAction<Worker | null>>
  filterPopoverOpen: boolean
  setFilterPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>

  // Action handlers
  handleDeleteWorker: (worker: Worker) => void
  handleConfirmDelete: () => void
  handleDeleteMultiple: (selectedIds: number[]) => void
  handleAddWorker: (worker: Worker) => Promise<void>
  handleEditWorker: (worker: Worker) => Promise<void>
  handleSearchChange: (value: string) => void
  handleSearch: () => void
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleApplyFilters: () => void
  resetFilters: () => void
  refreshTable: (page?: number) => void
}

export function useWorkersTable({
  initialFilters = {}
}: UseWorkersTableProps = {}): UseWorkersTableReturn {
  const FIRST_PAGE = 1

  // Table state from store
  const {
    workers,
    loadingState,
    pagination,
    fetchWorkers,
    addWorker,
    updateWorker,
    deleteWorker,
    deleteWorkers,
    setFilters: setStoreFilters
  } = useWorkersStore()

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [filters, setFilters] = React.useState<WorkerFilters>(initialFilters)
  const [tempFilters, setTempFilters] = React.useState<WorkerFilters>(initialFilters)
  const [searchTerm, setSearchTerm] = React.useState('')

  // UI state
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = React.useState(false)
  const [workerToDelete, setWorkerToDelete] = React.useState<Worker | null>(null)
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)

  // Fetch workers on mount and when dependencies change
  React.useEffect(() => {
    fetchWorkers(filters, pagination.page, pagination.pageSize)
  }, [fetchWorkers, filters, pagination.page, pagination.pageSize])

  // Helper function to update filters
  const updateFilters = React.useCallback(
    (updatedFilters: WorkerFilters) => {
      setFilters(updatedFilters)
      setStoreFilters(updatedFilters)
    },
    [setStoreFilters]
  )

  // Handler functions
  const handleDeleteWorker = React.useCallback((worker: Worker) => {
    setWorkerToDelete(worker)
    setDeleteConfirmOpen(true)
  }, [])

  const refreshTable = React.useCallback(
    (page = pagination.page) => {
      fetchWorkers(filters, page, pagination.pageSize)
    },
    [fetchWorkers, filters, pagination.page, pagination.pageSize]
  )

  const handleConfirmDelete = React.useCallback(() => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id)
      refreshTable()
    }
    setDeleteConfirmOpen(false)
  }, [deleteWorker, refreshTable, workerToDelete])

  const handleDeleteMultiple = React.useCallback(
    (selectedIds: number[]) => {
      deleteWorkers(selectedIds)
      setRowSelection({})
      refreshTable(FIRST_PAGE)
      setDeleteMultipleConfirmOpen(false)
    },
    [deleteWorkers, refreshTable]
  )

  const handleAddWorker = React.useCallback(
    async (worker: Worker) => {
      await addWorker(worker)
      setAddDialogOpen(false)
      refreshTable(FIRST_PAGE)
    },
    [addWorker, refreshTable]
  )

  const handleEditWorker = React.useCallback(
    async (worker: Worker) => {
      await updateWorker(worker)
      setSelectedWorker(null)
      refreshTable()
    },
    [updateWorker, refreshTable]
  )

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleSearch = React.useCallback(() => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    refreshTable(FIRST_PAGE)
  }, [filters, searchTerm, updateFilters, refreshTable])

  const handleFilterChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setTempFilters(prev => {
      // Create a new object to avoid mutating state
      const result = { ...prev } as WorkerFilters

      if (value === '') {
        delete result[name as keyof WorkerFilters]
      } else {
        // For numeric fields, convert to numbers
        if (name.includes('Age') || name.includes('Salary')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(result as any)[name] = Number(value)
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(result as any)[name] = value
        }
      }

      return result
    })
  }, [])

  const handleApplyFilters = React.useCallback(() => {
    updateFilters(tempFilters)
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }, [tempFilters, updateFilters, refreshTable])

  const resetFilters = React.useCallback(() => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }, [updateFilters, refreshTable])

  return {
    // Table state
    workers,
    loadingState,
    pagination,

    // Table UI state
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,

    // Filter state
    filters,
    tempFilters,
    searchTerm,

    // UI state
    addDialogOpen,
    setAddDialogOpen,
    selectedWorker,
    setSelectedWorker,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteMultipleConfirmOpen,
    setDeleteMultipleConfirmOpen,
    workerToDelete,
    setWorkerToDelete,
    filterPopoverOpen,
    setFilterPopoverOpen,

    // Action handlers
    handleDeleteWorker,
    handleConfirmDelete,
    handleDeleteMultiple,
    handleAddWorker,
    handleEditWorker,
    handleSearchChange,
    handleSearch,
    handleFilterChange,
    handleApplyFilters,
    resetFilters,
    refreshTable
  }
}
