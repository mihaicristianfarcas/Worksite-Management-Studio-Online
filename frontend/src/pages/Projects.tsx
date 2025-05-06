import PageTitle from '@/components/page-title'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, Plus, RefreshCcwDot, Search, Trash2, Pencil } from 'lucide-react'
import { ProjectFilters } from '@/api/types'
import { useProjectsStore } from '@/store/projects-store'
import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import ProjectWorkersTable from '@/components/projects/assigned-workers-table'
import { Project } from '@/api/types'
import ProjectMap from '@/components/projects/site-map'
import AddProjectForm from '@/components/projects/project-add-form'
import EditProjectForm from '@/components/projects/project-edit-form'
import ProjectWorkersManagementDialog from '@/components/projects/project-workers-management-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import React from 'react'

export default function Projects() {
  const FIRST_PAGE = 1

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ProjectFilters>({})
  const [tempFilters, setTempFilters] = useState<ProjectFilters>({})
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false)

  // Store state
  const {
    projects,
    pagination,
    loadingState,
    fetchProjects,
    setFilters: setStoreFilters,
    addProject,
    updateProject,
    deleteProject
  } = useProjectsStore()

  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null)
  const [api, setApi] = useState<CarouselApi>()

  // Load projects when filters or pagination changes
  useEffect(() => {
    fetchProjects(filters, pagination.page, pagination.pageSize)
  }, [fetchProjects, filters, pagination.page, pagination.pageSize])

  // Set initial current project when projects load
  useEffect(() => {
    if (projects.length > 0) {
      if (currentProjectId) {
        // Try to find the previously selected project
        const previousProject = projects.find(p => p.id === currentProjectId)
        if (previousProject) {
          setCurrentProject(previousProject)

          // Find the index of the previous project and scroll to it
          if (api) {
            const index = projects.findIndex(p => p.id === currentProjectId)
            if (index !== -1) {
              // Use setTimeout to ensure the carousel has rendered
              setTimeout(() => {
                api.scrollTo(index)
              }, 0)
            }
          }
        } else {
          // If previous project not found, default to first project
          setCurrentProject(projects[0])
          setCurrentProjectId(projects[0].id)
        }
      } else if (!currentProject) {
        // Initial load - set first project
        setCurrentProject(projects[0])
        setCurrentProjectId(projects[0].id)
      }
    }
  }, [projects, currentProjectId, api, currentProject])

  // Handle carousel changes to update current project
  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap()
      if (projects[selectedIndex]) {
        setCurrentProject(projects[selectedIndex])
        setCurrentProjectId(projects[selectedIndex].id)
      }
    }

    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api, projects])

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
    refreshCarousel(FIRST_PAGE)
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

        // Properly handle the sortOrder field which has a specific type
        if (typedKey === 'sortOrder') {
          // Only assign if it's a valid value
          if (value === 'asc' || value === 'desc') {
            acc[typedKey] = value as 'asc' | 'desc'
          }
        } else {
          // For all other fields, assign the value directly
          acc[typedKey] = value as string
        }
      }
      return acc
    }, {} as ProjectFilters)

    // Preserve search term when applying other filters
    if (filters.search) {
      cleanedFilters.search = filters.search
    }

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    refreshCarousel(FIRST_PAGE)
  }

  const resetFilters = () => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshCarousel(FIRST_PAGE)
  }

  // Optimized refresh function that preserves the current project
  const refreshCarousel = useCallback(
    (page = pagination.page) => {
      const projectIdToKeep = currentProjectId

      return fetchProjects(filters, page, pagination.pageSize).then(() => {
        if (projectIdToKeep) {
          setCurrentProjectId(projectIdToKeep)
        }
      })
    },
    [fetchProjects, pagination.pageSize, currentProjectId]
  )

  // Project CRUD operations
  const handleAddProject = async (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => {
    try {
      await addProject(project as Project)
      setAddDialogOpen(false)
      refreshCarousel()
      toast.success('Project added successfully')
    } catch (err) {
      console.error('Error adding project:', err)
      toast.error('Failed to add project')
    }
  }

  const handleEditProject = async (project: Project) => {
    try {
      await updateProject(project)
      setEditDialogOpen(false)
      setSelectedProject(null)
      refreshCarousel()
      toast.success('Project updated successfully')
    } catch (err) {
      console.error('Error updating project:', err)
      toast.error('Failed to update project')
    }
  }

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id)
        refreshCarousel()
        toast.success('Project deleted successfully')
      } catch (err) {
        console.error('Error deleting project:', err)
        toast.error('Failed to delete project')
      }
    }
    setDeleteConfirmOpen(false)
    setProjectToDelete(null)
  }

  // Filter fields for the filter popover
  const filterFields = [
    { id: 'status', label: 'Status', type: 'text' },
    { id: 'startDateFrom', label: 'Start Date From', type: 'date' },
    { id: 'startDateTo', label: 'Start Date To', type: 'date' },
    { id: 'endDateFrom', label: 'End Date From', type: 'date' },
    { id: 'endDateTo', label: 'End Date To', type: 'date' }
  ]

  // Handler for worker management
  const handleWorkerManagementClose = () => {
    refreshCarousel()
  }

  return (
    <>
      <PageTitle>Projects</PageTitle>
      <div className='space-y-8'>
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

          {/* Refresh Button */}
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              resetFilters()
              refreshCarousel(FIRST_PAGE)
            }}
            disabled={loadingState === 'loading'}
          >
            <RefreshCcwDot className='h-4 w-4' />
          </Button>

          {/* Filter Button with Popover */}
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <Filter className='mr-2 h-4 w-4' />
                Filter
                {Object.keys(filters).length > 0 && (
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

          {/* Add Project Button */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>Create a new project in the database.</DialogDescription>
              </DialogHeader>
              <AddProjectForm onAddProject={handleAddProject} />
            </DialogContent>
          </Dialog>

          {/* Worker Management Button */}
          {currentProject && (
            <Button variant='outline' onClick={() => setWorkerDialogOpen(true)}>
              Manage Workers for {currentProject.name}
            </Button>
          )}
        </div>

        {/* Project Carousel */}
        <Carousel className='mx-auto w-[90%]' setApi={setApi}>
          <CarouselContent>
            {loadingState === 'loading' ? (
              <CarouselItem>
                <Card>
                  <CardContent className='flex h-40 items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                  </CardContent>
                </Card>
              </CarouselItem>
            ) : projects.length > 0 ? (
              projects.map(project => (
                <CarouselItem key={project.id}>
                  <div className='p-1'>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-xl'>{project.name}</CardTitle>
                        <div className='flex items-center space-x-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              setSelectedProject(project)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleDeleteProject(project)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
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
                              {project.start_date
                                ? format(new Date(project.start_date), 'PPP')
                                : '-'}
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

                  {/* Project Workers Table and Map */}
                  <div className='grid grid-cols-2 items-center justify-between gap-3 p-2'>
                    <div className='space-y-4'>
                      <h2 className='text-lg font-medium'>Assigned workers to {project.name}</h2>
                      <ProjectWorkersTable project={project} />
                    </div>
                    <ProjectMap project={project} />
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

        {/* Worker Assignment Dialog */}
        <ProjectWorkersManagementDialog
          project={currentProject}
          open={workerDialogOpen}
          onOpenChange={open => {
            setWorkerDialogOpen(open)
            if (!open) {
              handleWorkerManagementClose()
            }
          }}
        />

        {/* Edit Project Dialog */}
        {selectedProject && (
          <Dialog
            open={editDialogOpen}
            onOpenChange={open => {
              setEditDialogOpen(open)
              if (!open) setSelectedProject(null)
            }}
          >
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Modify project information.</DialogDescription>
              </DialogHeader>
              <EditProjectForm project={selectedProject} onEditProject={handleEditProject} />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirmation */}
        <ConfirmationDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title='Delete project'
          description={`Are you sure you want to delete ${projectToDelete?.name}? This action cannot be undone.`}
          confirmText='Delete'
          variant='destructive'
        />
      </div>
    </>
  )
}
