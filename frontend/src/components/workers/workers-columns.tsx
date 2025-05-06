import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Worker } from '@/api/types'
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

interface UseWorkersColumnsProps {
  onDeleteWorker: (worker: Worker) => void
  onEditWorker: (worker: Worker) => void
}

export function useWorkersColumns({
  onDeleteWorker,
  onEditWorker
}: UseWorkersColumnsProps): ColumnDef<Worker>[] {
  return React.useMemo<ColumnDef<Worker>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
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
        cell: ({ row }) => (
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
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Name
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('name')}</div>,
        size: 200
      },
      {
        accessorKey: 'age',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Age
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('age')}</div>,
        size: 100
      },
      {
        accessorKey: 'position',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Position
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('position')}</div>,
        size: 200
      },
      {
        accessorKey: 'salary',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Salary
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
                <DropdownMenuItem onClick={() => onEditWorker(worker)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteWorker(worker)} className='text-red-600'>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 80
      }
    ],
    [onDeleteWorker, onEditWorker]
  )
}
