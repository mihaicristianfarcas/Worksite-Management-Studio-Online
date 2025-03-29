import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Worker } from '@/api/workers-api'

// Column definitions factory
export function getWorkerColumns(
  onEditWorker: (worker: Worker) => void,
  onDeleteWorker: (worker: Worker) => void
): ColumnDef<Worker>[] {
  return [
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
      cell: ({ row }) => <div className='px-4 text-center capitalize'>{row.getValue('name')}</div>,
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
              <DropdownMenuItem onClick={() => onEditWorker(worker)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteWorker(worker)} className='text-red-600'>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 80 // Fixed width for actions column
    }
  ]
}
