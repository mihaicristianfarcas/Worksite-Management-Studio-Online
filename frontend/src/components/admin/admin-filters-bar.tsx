import { ChevronDown, RefreshCcwDot, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Column } from '@tanstack/react-table'
import { User } from '@/api/model/user'

interface AdminFiltersBarProps {
  // Column visibility
  columns: Column<User>[]
  columnVisibility: Record<string, boolean>
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void

  // Search
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void

  // Other actions
  onRefresh: () => void
  isLoading: boolean
}

export function AdminFiltersBar({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  searchTerm,
  onSearchChange,
  onSearch,
  onRefresh,
  isLoading
}: AdminFiltersBarProps) {
  return (
    <div className='flex items-center py-4'>
      {/* Search */}
      <div className='flex max-w-sm items-center'>
        <Input
          placeholder='Search users by username or email...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          className='rounded-r-none'
        />
        <Button variant='outline' className='rounded-l-none border-l-0' onClick={onSearch}>
          <Search className='h-4 w-4' />
        </Button>
      </div>

      {/* Refresh button */}
      <Button className='ml-3' variant='outline' onClick={onRefresh} disabled={isLoading}>
        <RefreshCcwDot className='h-4 w-4' />
      </Button>

      {/* Column visibility dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='ml-auto'>
            Columns <ChevronDown className='ml-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {columns
            .filter(column => column.getCanHide())
            .map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={value => {
                  const updated = { ...columnVisibility, [column.id]: !!value }
                  onColumnVisibilityChange(updated)
                }}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
