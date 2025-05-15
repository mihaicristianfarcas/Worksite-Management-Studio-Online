import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'

// UI Components
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

// Worker-specific components
import EditWorkerForm from '@/components/workers/worker-edit-form'
import { WorkersFiltersBar } from '@/components/workers/workers-filters-bar'
import { WorkersTable } from '@/components/workers/workers-table'
import { WorkersPagination } from '@/components/workers/workers-pagination'
import { useWorkersColumns } from '@/components/workers/workers-columns'

// Replaced the hook import with direct store import
import { useWorkersStore } from '@/api/store/workers-store'
import { useCallback, useEffect, useState } from 'react'
import { Worker, WorkerFilters } from '@/api/model/worker'

interface MainWorkersDataTableProps {
  // Optional props to customize the table
  initialWorkers?: Worker[]
  showFilters?: boolean
  showPagination?: boolean
  showActions?: boolean
  title?: string
  initialFilters?: WorkerFilters
}

export function MainWorkersDataTable({
  initialWorkers,
  showFilters = true,
  showPagination = true,
  showActions = true,
  title,
  initialFilters = {}
}: MainWorkersDataTableProps) {
  const FIRST_PAGE = 1
  const [mounted, setMounted] = useState(false)

  // Get workers data from store
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

  // Table UI state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Filter state
  const [filters, setFilters] = useState<WorkerFilters>(initialFilters)
  const [tempFilters, setTempFilters] = useState<WorkerFilters>(initialFilters)
  const [searchTerm, setSearchTerm] = useState('')

  // UI state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = useState(false)
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null)
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Fetch workers on mount and when dependencies change
  useEffect(() => {
    fetchWorkers(filters, pagination.page, pagination.pageSize)
  }, [fetchWorkers, filters, pagination.page, pagination.pageSize])

  // Helper function to update filters
  const updateFilters = useCallback(
    (updatedFilters: WorkerFilters) => {
      setFilters(updatedFilters)
      setStoreFilters(updatedFilters)
    },
    [setStoreFilters]
  )

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get columns configuration
  const columns = useWorkersColumns({
    onDeleteWorker: handleDeleteWorker,
    onEditWorker: setSelectedWorker,
    showActions
  })

  // Handler functions
  function handleDeleteWorker(worker: Worker) {
    setWorkerToDelete(worker)
    setDeleteConfirmOpen(true)
  }

  const refreshTable = useCallback(
    (page = pagination.page) => {
      fetchWorkers(filters, page, pagination.pageSize)
    },
    [fetchWorkers, filters, pagination.page, pagination.pageSize]
  )

  const handleConfirmDelete = useCallback(() => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id)
      refreshTable()
    }
    setDeleteConfirmOpen(false)
  }, [deleteWorker, refreshTable, workerToDelete])

  const handleDeleteMultiple = useCallback(
    (selectedIds: number[]) => {
      deleteWorkers(selectedIds)
      setRowSelection({})
      refreshTable(FIRST_PAGE)
      setDeleteMultipleConfirmOpen(false)
    },
    [deleteWorkers, refreshTable]
  )

  const handleAddWorker = useCallback(
    async (worker: Worker) => {
      await addWorker(worker)
      setAddDialogOpen(false)
      refreshTable(FIRST_PAGE)
    },
    [addWorker, refreshTable]
  )

  const handleEditWorker = useCallback(
    async (worker: Worker) => {
      await updateWorker(worker)
      setSelectedWorker(null)
      refreshTable()
    },
    [updateWorker, refreshTable]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleSearch = useCallback(() => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    refreshTable(FIRST_PAGE)
  }, [filters, searchTerm, updateFilters, refreshTable])

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleApplyFilters = useCallback(() => {
    updateFilters(tempFilters)
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }, [tempFilters, updateFilters, refreshTable])

  const resetFilters = useCallback(() => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }, [updateFilters, refreshTable])

  // Create table instance
  const table = useReactTable({
    data: initialWorkers || workers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: showActions,
    enableMultiRowSelection: showActions,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _, filterValue) => {
      const search = filterValue.toLowerCase()
      return Object.values(row.original).some(value => {
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(search)
          )
        }
        return String(value).toLowerCase().includes(search)
      })
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  })

  // Handler for full reset
  const handleFullReset = () => {
    resetFilters()
    setRowSelection({})
    setGlobalFilter('')
    setSorting([])
    setColumnVisibility({})
    refreshTable(FIRST_PAGE) // Reset to first page
  }

  // Handler for deleting multiple workers
  const handleMultipleDelete = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    handleDeleteMultiple(selectedIds)
  }

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  return (
    <div className='space-y-4'>
      {title && <h3 className='text-lg font-semibold'>{title}</h3>}

      {/* Filters Bar */}
      {showFilters && (
        <WorkersFiltersBar
          columns={table.getAllColumns()}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          onDeleteSelected={() => setDeleteMultipleConfirmOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          filters={filters}
          tempFilters={tempFilters}
          filterPopoverOpen={filterPopoverOpen}
          onFilterPopoverChange={setFilterPopoverOpen}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={resetFilters}
          addDialogOpen={addDialogOpen}
          onAddDialogChange={setAddDialogOpen}
          onAddWorker={handleAddWorker}
          onRefresh={handleFullReset}
          isLoading={loadingState === 'loading'}
        />
      )}

      {/* Table */}
      <WorkersTable table={table} columns={columns} />

      {/* Pagination */}
      {showPagination && (
        <WorkersPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          onPageChange={refreshTable}
          workers={initialWorkers || workers || []}
        />
      )}

      {/* Dialogs */}
      {showActions && (
        <>
          {/* Edit worker dialog */}
          <Dialog open={!!selectedWorker} onOpenChange={open => !open && setSelectedWorker(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit worker</DialogTitle>
                <DialogDescription>Modify worker information.</DialogDescription>
              </DialogHeader>
              {selectedWorker && (
                <EditWorkerForm worker={selectedWorker} onEditWorker={handleEditWorker} />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete confirmations */}
          <ConfirmationDialog
            isOpen={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title='Delete worker'
            description={`Are you sure you want to delete ${workerToDelete?.name}? This action cannot be undone.`}
            confirmText='Delete'
            variant='destructive'
          />

          <ConfirmationDialog
            isOpen={deleteMultipleConfirmOpen}
            onClose={() => setDeleteMultipleConfirmOpen(false)}
            onConfirm={handleMultipleDelete}
            title='Delete selected workers'
            description='Are you sure you want to delete the selected workers? This action cannot be undone.'
            confirmText='Delete'
            variant='destructive'
          />
        </>
      )}
    </div>
  )
}
