import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  Row,
  Table as TableInstance,
  Column
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCcwDot,
  Search
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

// Worker-specific components
import AddWorkerForm from '@/components/workers/worker-add-form'
import EditWorkerForm from '@/components/workers/worker-edit-form'

// API and store
import { Worker, WorkerFilters } from '@/api/types'
import { useWorkersStore } from '@/store/workers-store'

export function WorkersDataTable() {
  const FIRST_PAGE = 1

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [filters, setFilters] = React.useState<WorkerFilters>({})
  const [tempFilters, setTempFilters] = React.useState<WorkerFilters>({})
  const [searchTerm, setSearchTerm] = React.useState('')

  // UI state
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = React.useState(false)
  const [workerToDelete, setWorkerToDelete] = React.useState<Worker | null>(null)
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

  // Fetch workers on mount and when dependencies change
  React.useEffect(() => {
    fetchWorkers(filters, pagination.page, pagination.pageSize)
  }, [fetchWorkers, filters, pagination.page, pagination.pageSize])

  // Define table columns
  const columns = React.useMemo<ColumnDef<Worker>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: TableInstance<Worker> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
            className='mx-auto'
          />
        ),
        cell: ({ row }: { row: Row<Worker> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='mx-auto'
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50
      },
      {
        accessorKey: 'name',
        header: ({ column }: { column: Column<Worker> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Name
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Worker> }) => (
          <div className='text-center capitalize'>{row.getValue('name')}</div>
        ),
        size: 200
      },
      {
        accessorKey: 'age',
        header: ({ column }: { column: Column<Worker> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Age
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Worker> }) => (
          <div className='text-center'>{row.getValue('age')}</div>
        ),
        size: 100
      },
      {
        accessorKey: 'position',
        header: ({ column }: { column: Column<Worker> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Position
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Worker> }) => (
          <div className='text-center capitalize'>{row.getValue('position')}</div>
        ),
        size: 200
      },
      {
        accessorKey: 'salary',
        header: ({ column }: { column: Column<Worker> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Salary
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Worker> }) => {
          const amount = parseFloat(row.getValue('salary'))
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'RON'
          }).format(amount)

          return <div className='text-center font-medium'>{formatted}</div>
        },
        size: 150
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }: { row: Row<Worker> }) => {
          const worker = row.original

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
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(worker.id.toString())}
                >
                  Copy worker ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedWorker(worker)}>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteWorker(worker)}
                  className='text-red-600'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 80
      }
    ],
    []
  )

  // Create table instance
  const table = useReactTable({
    data: workers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
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

  // Simplified handler functions
  const handleDeleteWorker = (worker: Worker) => {
    setWorkerToDelete(worker)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (workerToDelete) {
      deleteWorker(workerToDelete.id)
      refreshTable()
    }
    setDeleteConfirmOpen(false)
  }

  const handleDeleteMultiple = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    deleteWorkers(selectedIds)
    setRowSelection({})
    refreshTable(FIRST_PAGE)
    setDeleteMultipleConfirmOpen(false)
  }

  const handleAddWorker = async (worker: Worker) => {
    await addWorker(worker)
    setAddDialogOpen(false)
    refreshTable(FIRST_PAGE)
  }

  const handleEditWorker = async (worker: Worker) => {
    await updateWorker(worker)
    setSelectedWorker(null)
    refreshTable()
  }

  // Helper functions
  const updateFilters = (updatedFilters: WorkerFilters) => {
    setFilters(updatedFilters)
    setStoreFilters(updatedFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    refreshTable(FIRST_PAGE)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedFilters = {
      ...tempFilters,
      [name]:
        value === ''
          ? undefined
          : name.includes('Age') || name.includes('Salary')
            ? Number(value)
            : value
    } as Partial<WorkerFilters>
    setTempFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    const cleanedFilters = Object.entries(tempFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        const typedKey = key as keyof WorkerFilters
        acc[typedKey] = value as WorkerFilters[keyof WorkerFilters]
      }
      return acc
    }, {} as WorkerFilters)

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }

  const resetFilters = () => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshTable(FIRST_PAGE)
  }

  const refreshTable = (page = pagination.page) => {
    fetchWorkers(filters, page, pagination.pageSize)
  }

  // Filter fields for popover
  const filterFields = [
    { id: 'minAge', label: 'Min Age', type: 'number', min: 18, max: 100 },
    { id: 'maxAge', label: 'Max Age', type: 'number', min: 18, max: 100 },
    { id: 'minSalary', label: 'Min Salary', type: 'number', min: 0, step: 1 },
    { id: 'maxSalary', label: 'Max Salary', type: 'number', min: 0, step: 1 },
    { id: 'position', label: 'Position', type: 'text' }
  ]

  return (
    <>
      {/* Toolbar */}
      <div className='flex items-center py-4'>
        {/* Search */}
        <div className='flex max-w-sm items-center'>
          <Input
            placeholder='Search workers...'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className='rounded-r-none'
          />
          <Button variant='outline' className='rounded-l-none border-l-0' onClick={handleSearch}>
            <Search className='h-4 w-4' />
          </Button>
        </div>

        {/* Refresh button */}
        <Button
          className='ml-3'
          variant='outline'
          onClick={() => {
            resetFilters()
            setRowSelection({})
            setGlobalFilter('')
            setSorting([])
            setColumnVisibility({})
            refreshTable(FIRST_PAGE)
          }}
          disabled={loadingState === 'loading'}
        >
          <RefreshCcwDot className='h-4 w-4' />
        </Button>

        {/* Filter Button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className='ml-3' variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
              {Object.keys(filters).length > 0 && (
                <span className='bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs'>
                  {Object.keys(filters).length}
                </span>
              )}
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
                {filterFields.map(field => (
                  <div key={field.id} className='grid grid-cols-3 items-center gap-4'>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      className='col-span-2'
                      value={tempFilters[field.id as keyof WorkerFilters] || ''}
                      onChange={handleFilterChange}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-between'>
                <Button variant='outline' onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add worker dialog trigger */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='ml-3'>
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

        {/* Delete selected button */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            className='ml-3 bg-red-600 hover:bg-red-700'
            onClick={() => setDeleteMultipleConfirmOpen(true)}
          >
            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}

        {/* Column visibility dropdown */}
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
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className='text-center'
                    style={{ width: `${header.column.getSize()}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className='hover:bg-muted/30'>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} style={{ width: `${cell.column.getSize()}px` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of {pagination.total} row(s) selected.
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshTable(pagination.page - 1)}
            disabled={pagination.page <= 1 || pagination.total === 0}
          >
            Previous
          </Button>
          <span className='text-muted-foreground text-sm'>
            {pagination.total === 0
              ? 'No results'
              : `Page ${pagination.page} of ${Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}`}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshTable(pagination.page + 1)}
            disabled={
              pagination.page * pagination.pageSize >= pagination.total || pagination.total === 0
            }
          >
            Next
          </Button>
          <span className='text-muted-foreground ml-2 text-sm'>
            {pagination.total === 0
              ? 'No workers found'
              : `Showing ${workers.length} of ${pagination.total} workers`}
          </span>
        </div>
      </div>

      {/* Dialogs */}
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
        onConfirm={handleDeleteMultiple}
        title='Delete multiple workers'
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} workers? This action cannot be undone.`}
        confirmText='Delete All'
        variant='destructive'
      />
    </>
  )
}
