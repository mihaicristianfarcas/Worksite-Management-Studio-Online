import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, RefreshCcwDot, Search } from 'lucide-react'
import { ProjectFilters } from '@/api/projects-api'
import { useProjectsStore } from '@/store/projects-store'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'

export function ProjectsCarousel() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProjectFilters>({})
  const [tempFilters, setTempFilters] = useState<ProjectFilters>({})
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Store state
  const { projects, pagination, fetchProjects, setFilters: setStoreFilters } = useProjectsStore()

  // Load projects when filters or pagination changes
  useEffect(() => {
    fetchProjects(filters, pagination.page, pagination.pageSize)
  }, [fetchProjects, filters, pagination.page, pagination.pageSize])

  // Helper functions for filters
  const updateFilters = (updatedFilters: ProjectFilters) => {
    setFilters(updatedFilters)
    setStoreFilters(updatedFilters)
  }

  // Search functionality
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    refreshCarousel(1)
  }

  // Filter functionality
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedFilters = {
      ...tempFilters,
      [name]:
        value === ''
          ? undefined
          : name === 'startDateFrom' ||
              name === 'startDateTo' ||
              name === 'endDateFrom' ||
              name === 'endDateTo'
            ? value // Keep date strings as is
            : value
    } as Partial<ProjectFilters>
    setTempFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    const cleanedFilters = Object.entries(tempFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        const typedKey = key as keyof ProjectFilters
        acc[typedKey] = value as ProjectFilters[keyof ProjectFilters]
      }
      return acc
    }, {} as ProjectFilters)

    // Preserve search term when applying other filters
    if (filters.search) {
      cleanedFilters.search = filters.search
    }

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    refreshCarousel(1)
  }

  const resetFilters = () => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshCarousel(1)
  }

  const refreshCarousel = (page = pagination.page) => {
    fetchProjects(filters, page, pagination.pageSize)
  }

  // Filter fields for the filter popover
  const filterFields = [
    { id: 'status', label: 'Status', type: 'text' },
    { id: 'startDateFrom', label: 'Start Date From', type: 'date' },
    { id: 'startDateTo', label: 'Start Date To', type: 'date' },
    { id: 'endDateFrom', label: 'End Date From', type: 'date' },
    { id: 'endDateTo', label: 'End Date To', type: 'date' }
  ]

  return (
    <div className='space-y-4'>
      {/* Search and Filter Toolbar */}
      <div className='flex items-center gap-4'>
        {/* Search Input with Button */}
        <div className='flex max-w-sm items-center'>
          <Input
            placeholder='Search projects...'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className='rounded-r-none'
          />
          <Button variant='outline' className='rounded-l-none border-l-0' onClick={handleSearch}>
            <Search className='h-4 w-4' />
          </Button>
        </div>

        {/* Filter Button with Popover */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
              {Object.keys(filters).length > 0 && filters.search === undefined && (
                <span className='bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs'>
                  {Object.keys(filters).filter(key => key !== 'search').length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Filter Projects</h4>
                <p className='text-muted-foreground text-sm'>
                  Set filters to find specific projects
                </p>
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
                      value={tempFilters[field.id as keyof ProjectFilters] || ''}
                      onChange={handleFilterChange}
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-between'>
                <Button variant='outline' onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Refresh Button */}
        <Button variant='outline' size='icon' onClick={() => refreshCarousel()}>
          <RefreshCcwDot className='h-4 w-4' />
        </Button>
      </div>

      {/* Project Carousel */}
      <Carousel className='mx-auto w-[95%]'>
        <CarouselContent>
          {projects.length > 0 ? (
            projects.map(project => (
              <CarouselItem key={project.id}>
                <div className='p-1'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-xl'>{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-2'>
                        <p className='text-muted-foreground text-sm'>{project.description}</p>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Status:</span>
                          <span className='text-sm capitalize'>{project.status}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Start Date:</span>
                          <span className='text-sm'>
                            {project.start_date ? format(new Date(project.start_date), 'PPP') : '-'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>End Date:</span>
                          <span className='text-sm'>
                            {project.end_date ? format(new Date(project.end_date), 'PPP') : '-'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className='p-1'>
                <Card>
                  <CardContent className='flex h-40 items-center justify-center'>
                    <p className='text-muted-foreground'>No projects found.</p>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        {projects.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>

      {/* Pagination Info */}
      <div className='flex items-center justify-end space-x-2 py-2'>
        <span className='text-muted-foreground text-sm'>
          {pagination.total === 0
            ? 'No projects found'
            : `Showing ${Math.min(projects.length, pagination.pageSize)} of ${pagination.total} projects`}
        </span>
      </div>
    </div>
  )
}
