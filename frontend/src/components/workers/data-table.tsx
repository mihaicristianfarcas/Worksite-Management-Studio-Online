import * as React from 'react'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDown, Plus, RefreshCcwDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import AddWorkerForm from '@/components/workers/add-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import EditWorkerForm from '@/components/workers/edit-form'
import { Worker } from '@/api/workers-api'
import { getWorkerColumns } from './columns'
import { useWorkersStore } from '@/store/workers-store'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

export function WorkersDataTable() {
  // State for table
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null)

  // Confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = React.useState(false)
  const [workerToDelete, setWorkerToDelete] = React.useState<Worker | null>(null)

  // Get data and methods from store
  const { workers, isLoading, fetchWorkers, addWorker, updateWorker, deleteWorker, deleteWorkers } =
    useWorkersStore()

  // Fetch workers data on mount
  React.useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Handle opening delete confirmation for a single worker
  const handleDeleteWorkerClick = (worker: Worker) => {
    setWorkerToDelete(worker)
    setDeleteConfirmOpen(true)
  }

  // Handle actual deletion after confirmation
  const confirmDeleteWorker = () => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id)
    }
  }

  // Handle confirming multiple deletions
  const confirmDeleteMultiple = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)
    deleteWorkers(selectedIds)
    setRowSelection({}) // Clear selection after delete
  }

  // Handle adding new worker
  const handleAddWorker = async (worker: Worker) => {
    await addWorker(worker)
    setAddDialogOpen(false)
  }

  // Handle editing worker
  const handleEditWorker = async (updatedWorker: Worker) => {
    await updateWorker(updatedWorker)
    setSelectedWorker(null) // Clear selected worker after edit
  }

  // Set up columns
  const columns = React.useMemo(
    () => getWorkerColumns(setSelectedWorker, handleDeleteWorkerClick),
    [setSelectedWorker]
  )

  // Create table instance
  const table = useReactTable({
    data: workers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,

    // Custom global filter function that searches across all fields
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()

      // Check all accessible values in the row
      return Object.values(row.original).some(value => {
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(search)
          )
        }

        // Handle primitive values
        return String(value).toLowerCase().includes(search)
      })
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  })

  // Calculate total table width based on column sizes
  const tableWidth = React.useMemo(() => {
    return columns.reduce((acc, column) => acc + (column.size || 150), 0)
  }, [columns])

  return (
    <>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Search workers...'
          value={globalFilter}
          onChange={event => setGlobalFilter(event.target.value)}
          className='max-w-sm'
        />

        {/* Refresh button */}
        <Button className='ml-3' variant='outline' onClick={fetchWorkers} disabled={isLoading}>
          <RefreshCcwDot className='h-4 w-4' />
        </Button>

        {/* Add workers dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='mx-3' variant='outline'>
              <Plus className='mr-2 h-4 w-4' />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a worker</DialogTitle>
              <DialogDescription>Add a worker to the database.</DialogDescription>
            </DialogHeader>
            <AddWorkerForm onAddWorker={handleAddWorker} />
          </DialogContent>
        </Dialog>

        {/* Delete workers button - show when rows are selected */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            className='ml-3'
            variant='destructive'
            onClick={() => setDeleteMultipleConfirmOpen(true)}
          >
            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className='py-1.5 text-center'
                      style={{ width: `${header.column.getSize()}px` }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  <div className='flex h-full items-center justify-center'>Loading workers...</div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className='hover:bg-muted/30'>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className='py-3 text-center'
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  <div className='flex h-full items-center justify-center'>No results.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

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

      {/* Single worker delete confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteWorker}
        title='Delete worker'
        description={`Are you sure you want to delete ${workerToDelete?.name}? This action cannot be undone.`}
        confirmText='Delete'
        variant='destructive'
      />

      {/* Multiple workers delete confirmation */}
      <ConfirmationDialog
        isOpen={deleteMultipleConfirmOpen}
        onClose={() => setDeleteMultipleConfirmOpen(false)}
        onConfirm={confirmDeleteMultiple}
        title='Delete multiple workers'
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} workers? This action cannot be undone.`}
        confirmText='Delete All'
        variant='destructive'
      />
    </>
  )
}
