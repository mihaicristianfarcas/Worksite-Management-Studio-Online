import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Filter, MoreHorizontal, Plus, RefreshCcwDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Worker, WorkerFilters } from '@/api/workers-api'
import { useWorkersStore } from '@/store/workers-store'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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

  // Filter states
  const [filters, setFilters] = React.useState<WorkerFilters>({})
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)

  // Get data and methods from store
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

  // Fetch workers data on mount
  React.useEffect(() => {
    fetchWorkers(filters, pagination.page, pagination.pageSize)
  }, [fetchWorkers, filters, pagination.page, pagination.pageSize])

  // Handle opening delete confirmation for a single worker
  const handleDeleteWorkerClick = (worker: Worker) => {
    setWorkerToDelete(worker)
    setDeleteConfirmOpen(true)
  }

  // Handle actual deletion after confirmation
  const confirmDeleteWorker = () => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id)
      fetchWorkers(filters, pagination.page, pagination.pageSize) // Refresh data
    }
  }

  // Handle confirming multiple deletions
  const confirmDeleteMultiple = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)
    deleteWorkers(selectedIds)
    setRowSelection({}) // Clear selection after delete
    fetchWorkers(filters, pagination.page, pagination.pageSize) // Refresh data
  }

  // Handle adding new worker
  const handleAddWorker = async (worker: Worker) => {
    await addWorker(worker)
    setAddDialogOpen(false)
    fetchWorkers(filters, pagination.page, pagination.pageSize) // Refresh data
  }

  // Handle editing worker
  const handleEditWorker = async (updatedWorker: Worker) => {
    await updateWorker(updatedWorker)
    setSelectedWorker(null) // Clear selected worker after edit
    fetchWorkers(filters, pagination.page, pagination.pageSize) // Refresh data
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedFilters = {
      ...filters,
      [name]:
        value === ''
          ? undefined
          : name.includes('Age') || name.includes('Salary')
            ? Number(value)
            : value
    }

    setFilters(updatedFilters)
    setStoreFilters(updatedFilters)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({})
    setStoreFilters({})
    setFilterPopoverOpen(false)
    fetchWorkers({}, pagination.page, pagination.pageSize) // Fetch all workers
  }

  // Define columns
  const columns = React.useMemo<ColumnDef<Worker>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className='flex justify-center'>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label='Select all'
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className='flex justify-center'>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
              aria-label='Select row'
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50 // Fixed width for checkbox column
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className='w-full justify-center px-4'
            >
              Name
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className='px-4 text-center capitalize'>{row.getValue('name')}</div>
        ),
        size: 200 // Fixed width for name column
      },
      {
        accessorKey: 'age',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className='w-full justify-center px-4'
            >
              Age
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => <div className='px-4 text-center'>{row.getValue('age')}</div>,
        size: 100 // Fixed width for age column
      },
      {
        accessorKey: 'position',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className='w-full justify-center px-4'
            >
              Position
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className='px-4 text-center capitalize'>{row.getValue('position')}</div>
        ),
        size: 200 // Fixed width for position column
      },
      {
        accessorKey: 'salary',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className='w-full justify-center px-4'
            >
              Salary
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('salary'))

          // Format the amount as a RON amount
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'RON'
          }).format(amount)

          return <div className='px-4 text-center font-medium'>{formatted}</div>
        },
        size: 150 // Fixed width for salary column
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const worker = row.original as Worker

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(worker.id)}>
                  Copy worker ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedWorker(worker)}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteWorkerClick(worker)}
                  className='text-red-600'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 80 // Fixed width for actions column
      }
    ],
    []
  )

  // Create table instance
  const table = useReactTable({
    data: workers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchWorkers(filters, newPage, pagination.pageSize)
  }

  return (
    <>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Search workers...'
          value={globalFilter}
          onChange={event => setGlobalFilter(event.target.value)}
          className='max-w-sm'
        />

        {/* Filter popover */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className='ml-3' variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Filter Workers</h4>
                <p className='text-muted-foreground text-sm'>
                  Set filters to find specific workers
                </p>
              </div>
              <div className='grid gap-2'>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='minAge'>Minimum Age</Label>
                  <Input
                    id='minAge'
                    name='minAge'
                    type='number'
                    className='col-span-2'
                    value={filters.minAge || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='maxAge'>Maximum Age</Label>
                  <Input
                    id='maxAge'
                    name='maxAge'
                    type='number'
                    className='col-span-2'
                    value={filters.maxAge || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='minSalary'>Minimum Salary</Label>
                  <Input
                    id='minSalary'
                    name='minSalary'
                    type='number'
                    className='col-span-2'
                    value={filters.minSalary || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='maxSalary'>Maximum Salary</Label>
                  <Input
                    id='maxSalary'
                    name='maxSalary'
                    type='number'
                    className='col-span-2'
                    value={filters.maxSalary || ''}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className='grid grid-cols-3 items-center gap-4'>
                  <Label htmlFor='position'>Position</Label>
                  <Input
                    id='position'
                    name='position'
                    type='text'
                    className='col-span-2'
                    value={filters.position || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <Button variant='outline' onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Refresh button */}
        <Button
          className='ml-3'
          variant='outline'
          onClick={() => fetchWorkers(filters, pagination.page, pagination.pageSize)}
          disabled={loadingState === 'loading'}
        >
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
            className='ml-3 bg-red-600 hover:bg-red-700'
            variant='outline'
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
            {table.getRowModel().rows?.length ? (
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
          {table.getFilteredSelectedRowModel().rows.length} of {pagination.total} row(s) selected.
        </div>
        <div className='space-x-2'>
          <span className='text-muted-foreground text-sm'>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              handlePageChange(pagination.page - 1)
            }}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              handlePageChange(pagination.page + 1)
            }}
            disabled={pagination.page * pagination.pageSize >= pagination.total}
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
