import PageTitle from '@/components/page-title'
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
import { Filter, Plus, RefreshCcwDot, Search, Trash2, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import ProjectWorkersTable from '@/components/projects/assigned-workers-table'
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
import { Loader2 } from 'lucide-react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import React from 'react'
import { useProjectsManagement } from '@/hooks/useProjectsManagement'

export default function Projects() {
  const {
    // State
    projects,
    loadingState,
    currentProject,
    searchTerm,
    filters,
    tempFilters,
    filterPopoverOpen,
    addDialogOpen,
    editDialogOpen,
    selectedProject,
    projectToDelete,
    deleteConfirmOpen,
    workerDialogOpen,

    // State setters
    setFilterPopoverOpen,
    setAddDialogOpen,
    setEditDialogOpen,
    setSelectedProject,
    setDeleteConfirmOpen,
    setWorkerDialogOpen,

    // Filter handlers
    handleSearchChange,
    handleSearch,
    handleFilterChange,
    handleApplyFilters,
    resetFilters,

    // CRUD operations
    handleAddProject,
    handleEditProject,
    handleInitiateDelete: handleDeleteProject,
    handleConfirmDelete,

    // Carousel
    refreshCarousel,
    handleCarouselChange,
    FIRST_PAGE
  } = useProjectsManagement()

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
                        value={tempFilters[field.id as keyof typeof tempFilters] || ''}
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
        <Carousel className='mx-auto w-[90%]' setApi={handleCarouselChange}>
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
