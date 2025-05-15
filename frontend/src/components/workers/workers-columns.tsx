import * as React from 'react'
import { ColumnDef, Row, Table } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Worker } from '@/api/model/worker'
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
  showActions?: boolean
}

export function useWorkersColumns({
  onDeleteWorker,
  onEditWorker,
  showActions = true
}: UseWorkersColumnsProps): ColumnDef<Worker>[] {
  return React.useMemo<ColumnDef<Worker>[]>(
    () => [
      ...(showActions
        ? [
            {
              id: 'select',
              header: ({ table }: { table: Table<Worker> }) => (
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
            }
          ]
        : []),
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
      ...(showActions
        ? [
            {
              id: 'actions',
              header: () => <div className='text-center'>Actions</div>,
              cell: ({ row }: { row: Row<Worker> }) => {
                const worker = row.original

                return (
                  <div className='text-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditWorker(worker)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() => onDeleteWorker(worker)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              },
              size: 50
            }
          ]
        : [])
    ],
    [onDeleteWorker, onEditWorker, showActions]
  )
}
