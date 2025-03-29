import * as React from 'react'
import {
  ColumnDef,
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, RefreshCcwDot } from 'lucide-react'
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
} from '../ui/dialog'
import EditWorkerForm from '@/components/workers/edit-form'
import { Worker } from '@/data/model'
import { toast } from 'sonner'

// API base URL - make sure this matches your backend
const API_URL = 'http://localhost:8080/api'

export function WorkersDataTable() {
  const columns: ColumnDef<Worker>[] = [
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
      enableHiding: false
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
      cell: ({ row }) => <div className='px-4 capitalize'>{row.getValue('name')}</div>
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
      cell: ({ row }) => <div className='px-4'>{row.getValue('age')}</div>
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
      cell: ({ row }) => <div className='px-4 capitalize'>{row.getValue('position')}</div>
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

        return <div className='px-4 font-medium'>{formatted}</div>
      }
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
                onClick={() => handleDeleteWorker(worker.id)}
                className='text-red-600'
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Use state to store/show add worker dialog
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)

  // Use state to store workers
  const [workers, setWorkers] = React.useState<Worker[]>([])

  // Loading state
  const [isLoading, setIsLoading] = React.useState(false)

  // Fetch workers on component mount
  React.useEffect(() => {
    fetchWorkers()
  }, [])

  // Function to fetch workers from API
  const fetchWorkers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/workers`)
      if (!response.ok) {
        throw new Error('Failed to fetch workers')
      }
      const data = await response.json()
      setWorkers(data)
    } catch (error) {
      console.error('Error fetching workers:', error)
      toast.error('Error fetching workers. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Add function to handle adding new worker
  const handleAddWorker = async (worker: Worker) => {
    try {
      const response = await fetch(`${API_URL}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(worker)
      })

      if (!response.ok) {
        throw new Error('Failed to add worker')
      }

      const newWorker = await response.json()
      setWorkers(prev => [...prev, newWorker])
      setAddDialogOpen(false)

      toast.success('Worker added successfully!')
    } catch (error) {
      console.error('Error adding worker:', error)
      toast.error('Failed to add worker. Please try again.')
    }
  }

  // Function to delete a single worker
  const handleDeleteWorker = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete worker')
      }

      setWorkers(prev => prev.filter(worker => worker.id !== id))

      toast.success('Worker deleted successfully')
    } catch (error) {
      console.error('Error deleting worker:', error)
      toast.error('Failed to delete worker. Please try again.')
    }
  }

  // Add function to handle deleting (multiple) selected workers
  const handleDeleteWorkers = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)

    // Create a promise for each delete operation
    const deletePromises = selectedIds.map(id =>
      fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE'
      })
    )

    try {
      // Wait for all delete operations to complete
      const results = await Promise.allSettled(deletePromises)

      // Check if any operations failed
      const failedCount = results.filter(result => result.status === 'rejected').length

      if (failedCount > 0) {
        throw new Error(`Failed to delete ${failedCount} workers`)
      }

      // Update local state
      setWorkers(prev => prev.filter(worker => !selectedIds.includes(worker.id)))
      setRowSelection({}) // Clear selection after delete

      toast.success(`${selectedIds.length} workers deleted successfully!`)
    } catch (error) {
      console.error('Error deleting workers:', error)
      toast.error('Failed to delete some workers. Please refresh and try again.')

      // Refresh the data to ensure it's in sync with the backend
      fetchWorkers()
    }
  }

  // Add function to handle editing worker
  const handleEditWorker = async (updatedWorker: Worker) => {
    try {
      const response = await fetch(`${API_URL}/workers/${updatedWorker.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedWorker)
      })

      if (!response.ok) {
        throw new Error('Failed to update worker')
      }

      const updated = await response.json()
      setWorkers(prev => prev.map(worker => (worker.id === updated.id ? updated : worker)))
      setSelectedWorker(null) // Clear selected worker after edit
      toast.success('Worker updated successfully!')
    } catch (error) {
      console.error('Error updating worker:', error)
      toast.error('Failed to update worker. Please try again.')
    }
  }

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

    // Custom global filter function
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

        {/* Delete workers button - show when rows are selected */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button className='ml-3' variant='destructive' onClick={handleDeleteWorkers}>
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
                    <TableHead key={header.id} className='py-1.5'>
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
                  Loading workers...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className='hover:bg-muted/30'>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='py-3 text-center'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
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
    </>
  )
}
