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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from 'lucide-react'

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
import AddWorkerForm from './add-worker-form'

// TODO - Replace with real data
const data: Worker[] = [
  {
    id: 'm5gr84i9',
    name: 'Dorel',
    age: 34,
    position: 'Dulgher',
    salary: 2000
  },
  {
    id: 'fafwe9f9',
    name: 'Sica',
    age: 17,
    position: 'Cu roaba',
    salary: 1000
  },
  {
    id: 'egei4i9k',
    name: 'Mirel',
    age: 23,
    position: 'Pe buldo',
    salary: 3000
  },
  {
    id: 'aegk569b',
    name: 'Marcel',
    age: 55,
    position: 'Pavator',
    salary: 1500
  },
  {
    id: 'favke9fo',
    name: 'Ursu',
    age: 46,
    position: 'Fierar',
    salary: 2500
  }
]

// TODO replace with backend entity model
export type Worker = {
  id: string
  name: string
  age: number
  position: string
  salary: number
}

export const columns: ColumnDef<Worker>[] = [
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
    cell: ({ row }) => (
      <div className='px-4 capitalize'>{row.getValue('name')}</div>
    )
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
    cell: ({ row }) => (
      <div className='px-4 capitalize'>{row.getValue('position')}</div>
    )
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(worker.id)}
            >
              Copy worker ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export function WorkersDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Add workers from the table
  const [functionality, setFunctionality] = React.useState('')

  const [workers, setWorkers] = React.useState<Worker[]>(data)

  // Add function to handle adding new worker
  const handleAddWorker = (worker: Worker) => {
    setWorkers(prev => [...prev, worker])
  }

  // Add function to handle deleting selected workers
  const handleDeleteWorkers = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => row.original.id)
    setWorkers(prev => prev.filter(worker => !selectedIds.includes(worker.id)))
    setRowSelection({}) // Clear selection after delete
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Search workers...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={event =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />

        {/* Add workers button */}
        <Button
          className='ml-3'
          variant={functionality === 'add' ? 'default' : 'outline'}
          onClick={() =>
            setFunctionality(() => (functionality === 'add' ? '' : 'add'))
          }
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Worker
        </Button>

        {/* Delete workers button - show when rows are selected */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            className='ml-3'
            variant='destructive'
            onClick={handleDeleteWorkers}
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
                    <TableHead key={header.id} className='py-1.5'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    <TableCell key={cell.id} className='py-3 text-center'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
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

      <section>
        {functionality === 'add' && (
          <AddWorkerForm onAddWorker={handleAddWorker} />
        )}
      </section>
    </>
  )
}
