import { ProjectFilters } from '@/api/model/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, RefreshCcwDot, Search } from 'lucide-react'
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
  loadingState: 'idle' | 'loading' | 'error'
  onSearchChange: (value: string) => void
  onSearch: () => void
  onResetFilters: () => void
  onAddProject: () => void
  onManageWorkers?: () => void
  currentProjectName?: string
  onSortChange?: (field: string, order: 'asc' | 'desc') => void
}

// Toolbar component with search, filters, and add project button
const ProjectFiltersBar = ({
  searchTerm,
  filters,
  loadingState,
  onSearchChange,
  onSearch,
  onResetFilters,
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
    <div className='flex items-center justify-between'>
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

        {/* Worker Management Button */}
        <div className='min-w-56'>
          {loadingState === 'loading' ? (
            <Button variant='outline' disabled className='opacity-70'>
              <span className='animate-pulse'>Loading selected project...</span>
            </Button>
          ) : currentProjectName && onManageWorkers ? (
            <Button variant='outline' onClick={onManageWorkers}>
              Manage Workers for {currentProjectName}
            </Button>
          ) : (
            <Button variant='outline' disabled className='opacity-50'>
              Select a project to manage workers
            </Button>
          )}
        </div>
      </div>

      {/* Add Project Button */}
      <Button onClick={onAddProject}>
        <Plus className='mr-2 h-4 w-4' />
        Add Project
      </Button>
    </div>
  )
}

export default ProjectFiltersBar
