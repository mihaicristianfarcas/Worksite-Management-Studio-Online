import * as React from 'react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { User } from '@/api/model/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface UseAdminColumnsProps {
  onViewActivity: (user: User) => void
  onToggleActive: (user: User) => void
  onRoleChange: (user: User, role: string) => void
  showActions?: boolean
}

// Format a date string for display
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

export function useAdminColumns({
  onViewActivity,
  onToggleActive,
  onRoleChange,
  showActions = true
}: UseAdminColumnsProps): ColumnDef<User>[] {
  return React.useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            ID
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('id')}</div>,
        size: 80
      },
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Username
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('username')}</div>,
        size: 150
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Email
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('email')}</div>,
        size: 200
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Role
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <Select value={user.role} onValueChange={value => onRoleChange(user, value)}>
              <SelectTrigger className='h-8 w-full rounded-md'>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='user'>User</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
          )
        },
        size: 150
      },
      {
        accessorKey: 'active',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Status
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className='flex items-center justify-center space-x-2'>
              <Switch checked={user.active} onCheckedChange={() => onToggleActive(user)} />
              <Badge variant={user.active ? 'default' : 'destructive'} className='ml-2'>
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          )
        },
        size: 150
      },
      {
        accessorKey: 'last_login',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Last Login
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }) => (
          <div className='text-center'>{formatDate(row.getValue('last_login'))}</div>
        ),
        size: 180
      },
      ...(showActions
        ? [
            {
              id: 'actions',
              header: () => <div className='text-center'>Actions</div>,
              cell: ({ row }: { row: Row<User> }) => {
                const user = row.original
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
                        <DropdownMenuItem onClick={() => onViewActivity(user)}>
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggleActive(user)}>
                          {user.active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              },
              size: 80
            }
          ]
        : [])
    ],
    [onViewActivity, onToggleActive, onRoleChange, showActions]
  )
}
