import * as React from 'react'
import { ChevronDown, Filter, Plus, RefreshCcwDot, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Worker, WorkerFilters } from '@/services/types'
import AddWorkerForm from '@/components/workers/worker-add-form'
import { Column } from '@tanstack/react-table'

interface WorkersFiltersBarProps {
  columns: Column<Worker>[]
  columnVisibility: Record<string, boolean>
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void
  selectedCount: number
  onDeleteSelected: () => void

  // Search props
  searchTerm: string
  onSearchChange: (value: string) => void
  onSearch: () => void

  // Filter props
  filters: WorkerFilters
  tempFilters: WorkerFilters
  filterPopoverOpen: boolean
  onFilterPopoverChange: (open: boolean) => void
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyFilters: () => void
  onResetFilters: () => void

  // Dialog props
  addDialogOpen: boolean
  onAddDialogChange: (open: boolean) => void
  onAddWorker: (worker: Worker) => Promise<void>

  // Other actions
  onRefresh: () => void
  isLoading: boolean
}

// Filter fields for popover
const filterFields = [
  { id: 'minAge', label: 'Min Age', type: 'number', min: 18, max: 100 },
  { id: 'maxAge', label: 'Max Age', type: 'number', min: 18, max: 100 },
  { id: 'minSalary', label: 'Min Salary', type: 'number', min: 0, step: 1 },
  { id: 'maxSalary', label: 'Max Salary', type: 'number', min: 0, step: 1 },
  { id: 'position', label: 'Position', type: 'text' }
]

export function WorkersFiltersBar({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  selectedCount,
  onDeleteSelected,
  searchTerm,
  onSearchChange,
  onSearch,
  filters,
  tempFilters,
  filterPopoverOpen,
  onFilterPopoverChange,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  addDialogOpen,
  onAddDialogChange,
  onAddWorker,
  onRefresh,
  isLoading
}: WorkersFiltersBarProps) {
  return (
    <div className='flex items-center py-4'>
      {/* Search */}
      <div className='flex max-w-sm items-center'>
        <Input
          placeholder='Search workers...'
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

      {/* Filter Button */}
      <Popover open={filterPopoverOpen} onOpenChange={onFilterPopoverChange}>
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
              <p className='text-muted-foreground text-sm'>Set filters to find specific workers</p>
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
                    onChange={onFilterChange}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                  />
                </div>
              ))}
            </div>
            <div className='flex justify-between'>
              <Button variant='outline' onClick={onResetFilters}>
                Reset Filters
              </Button>
              <Button onClick={onApplyFilters}>Apply Filters</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Add worker dialog trigger */}
      <Dialog open={addDialogOpen} onOpenChange={onAddDialogChange}>
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
          <AddWorkerForm onAddWorker={onAddWorker} />
        </DialogContent>
      </Dialog>

      {/* Delete selected button */}
      {selectedCount > 0 && (
        <Button className='ml-3 bg-red-600 hover:bg-red-700' onClick={onDeleteSelected}>
          Delete Selected ({selectedCount})
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
