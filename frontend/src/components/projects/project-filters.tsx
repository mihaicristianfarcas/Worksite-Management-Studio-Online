import { ProjectFilters } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Filter, Plus, RefreshCcwDot, Search } from 'lucide-react'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface ProjectFiltersBarProps {
  searchTerm: string
  filters: ProjectFilters
  tempFilters: ProjectFilters
  filterPopoverOpen: boolean
  loadingState: 'idle' | 'loading' | 'error'
  onSearchChange: (value: string) => void
  onSearch: () => void
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  onFilterPopoverChange: (open: boolean) => void
  onAddProject: () => void
  onManageWorkers?: () => void
  currentProjectName?: string
  onSortChange?: (field: string, order: 'asc' | 'desc') => void
}

const filterFields = [{ id: 'status', label: 'Status', type: 'text' }]

/**
 * Toolbar component with search, filters, and add project button
 */
const ProjectFiltersBar = ({
  searchTerm,
  filters,
  tempFilters,
  filterPopoverOpen,
  loadingState,
  onSearchChange,
  onSearch,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onFilterPopoverChange,
  onAddProject,
  onManageWorkers,
  currentProjectName,
  onSortChange
}: ProjectFiltersBarProps) => {
  // Function to handle sort selection
  const handleSortChange = (value: string) => {
    if (!value || !onSortChange) return

    const [field, order] = value.split('-')
    onSortChange(field, order as 'asc' | 'desc')
  }

  // Get current sort value for Select default
  const getCurrentSortValue = () => {
    if (filters.sortBy && filters.sortOrder) {
      return `${filters.sortBy}-${filters.sortOrder}`
    }
    return ''
  }

  return (
    <div className='flex flex-wrap items-center gap-4'>
      {/* Search Input with Button */}
      <div className='flex max-w-sm items-center'>
        <Input
          placeholder='Search projects...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          className='rounded-r-none'
        />
        <Button variant='outline' className='rounded-l-none border-l-0' onClick={onSearch}>
          <Search className='h-4 w-4' />
        </Button>
      </div>

      {/* Sort By Select */}
      <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Sort by...' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='name-asc'>Name A-Z</SelectItem>
          <SelectItem value='name-desc'>Name Z-A</SelectItem>
          <SelectItem value='start_date-asc'>Date (Oldest first)</SelectItem>
          <SelectItem value='start_date-desc'>Date (Newest first)</SelectItem>
        </SelectContent>
      </Select>

      {/* Refresh Button */}
      <Button
        variant='outline'
        size='icon'
        onClick={onResetFilters}
        disabled={loadingState === 'loading'}
      >
        <RefreshCcwDot className='h-4 w-4' />
      </Button>

      {/* Filter Button with Popover */}
      <Popover open={filterPopoverOpen} onOpenChange={onFilterPopoverChange}>
        <PopoverTrigger asChild>
          <Button variant='outline'>
            <Filter className='mr-2 h-4 w-4' />
            Filter
            {Object.keys(filters).length > 0 && (
              <span className='bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs'>
                {
                  Object.keys(filters).filter(
                    key => key !== 'search' && key !== 'sortBy' && key !== 'sortOrder'
                  ).length
                }
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium leading-none'>Filter Projects</h4>
              <p className='text-muted-foreground text-sm'>Set filters to find specific projects</p>
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
                    value={tempFilters[field.id as keyof typeof tempFilters] || ''}
                    onChange={onFilterChange}
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

      {/* Add Project Button */}
      <Button onClick={onAddProject}>
        <Plus className='mr-2 h-4 w-4' />
        Add Project
      </Button>

      {/* Worker Management Button */}
      {currentProjectName && onManageWorkers && (
        <Button variant='outline' onClick={onManageWorkers}>
          Manage Workers for {currentProjectName}
        </Button>
      )}
    </div>
  )
}

export default ProjectFiltersBar
