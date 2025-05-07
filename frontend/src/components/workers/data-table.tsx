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
import AddWorkerForm from '@/components/workers/add-form'
import EditWorkerForm from '@/components/workers/edit-form'

// API and store
import { Worker, WorkerFilters } from '@/api/workers-api'
import { useWorkersStore } from '@/store/workers-store'

export function WorkersDataTable() {
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
    // Table state
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(worker.id)}>
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
    data: initialWorkers || workers,
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
    deleteWorkers(selectedIds)
    setRowSelection({})
    refreshTable(1)
    setDeleteMultipleConfirmOpen(false)
  }

  const handleAddWorker = async (worker: Worker) => {
    await addWorker(worker)
    setAddDialogOpen(false)
    refreshTable(1)
  }

  const handleEditWorker = async (worker: Worker) => {
    await updateWorker(worker)
    setSelectedWorker(null)
    refreshTable()
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
    }

    setTempFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    updateFilters(tempFilters)
    setFilterPopoverOpen(false)
    refreshTable(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearch = () => {
    const updatedFilters = searchTerm.trim()
      ? { ...filters, search: searchTerm.trim() }
      : { ...filters }

    if (!searchTerm.trim()) delete updatedFilters.search

    updateFilters(updatedFilters)
    refreshTable(1)
  }

  // Helper functions
  const updateFilters = (updatedFilters: WorkerFilters) => {
    setFilters(updatedFilters)
    setStoreFilters(updatedFilters)
  }

  const resetFilters = () => {
    setTempFilters({})
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshTable(1)
  }

  const refreshTable = (page = pagination.page) => {
    fetchWorkers(filters, page, pagination.pageSize)
  }

  // Filter fields for popover
  const filterFields = [
    { id: 'minAge', label: 'Min Age', type: 'number' },
    { id: 'maxAge', label: 'Max Age', type: 'number' },
    { id: 'minSalary', label: 'Min Salary', type: 'number' },
    { id: 'maxSalary', label: 'Max Salary', type: 'number' },
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
            setSearchTerm('')
            setRowSelection({})
            setGlobalFilter('')
            setSorting([])
            setColumnVisibility({})
            setFilters({})
            setTempFilters({})
            setStoreFilters({})
            setFilterPopoverOpen(false)
            refreshTable(1)
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
            <Button className='ml-3' variant='outline'>
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
      <WorkersTable table={table} columns={columns} />

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
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className='text-muted-foreground text-sm'>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshTable(pagination.page + 1)}
            disabled={pagination.page * pagination.pageSize >= pagination.total}
          >
            Next
          </Button>
          <span className='text-muted-foreground ml-2 text-sm'>
            Showing {workers.length} of {pagination.total} workers
          </span>
        </div>
      </div>

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
        onConfirm={handleDeleteMultiple}
        title='Delete multiple workers'
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} workers? This action cannot be undone.`}
        confirmText='Delete All'
        variant='destructive'
      />
    </>
  )
}
