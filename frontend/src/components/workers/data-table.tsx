import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
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

// Custom hooks
import { useWorkersTable } from '@/hooks/use-workers-table'
import { useEffect, useState } from 'react'
import { Worker } from '@/services/types'

interface WorkersDataTableProps {
  // Optional props to customize the table
  initialWorkers?: Worker[]
  showFilters?: boolean
  showPagination?: boolean
  showActions?: boolean
  title?: string
}

export function WorkersDataTable({
  initialWorkers,
  showFilters = true,
  showPagination = true,
  showActions = true,
  title
}: WorkersDataTableProps) {
  const [mounted, setMounted] = useState(false)

  // Get table state and handlers from custom hook
  const tableHook = useWorkersTable()

  const {
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
  } = tableHook

  // Get columns configuration
  const columns = useWorkersColumns({
    onDeleteWorker: handleDeleteWorker,
    onEditWorker: setSelectedWorker,
    showActions
  })

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

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
    refreshTable(1) // Reset to first page
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
