import PageTitle from '@/components/page-title'
import AddProjectForm from '@/components/projects/project-add-form'
import EditProjectForm from '@/components/projects/project-edit-form'
import ProjectWorkersManagementDialog from '@/components/projects/management-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import ProjectCarousel from '@/components/projects/project-carousel'
import ProjectDetails from '@/components/projects/project-details'
import ProjectFiltersBar from '@/components/projects/project-filters'
import { Project, ProjectFilters } from '@/api/model/project'
import { useState, useCallback, useEffect } from 'react'
import { useProjectsStore } from '@/api/store/projects-store'
import { toast } from 'sonner'
import { type CarouselApi } from '@/components/ui/carousel'

export default function Projects() {
  const FIRST_PAGE = 1

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

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setLocalFilters] = useState<ProjectFilters>({})
  const [tempFilters, setTempFilters] = useState<ProjectFilters>({})
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false)

  // Carousel state
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null)

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
  }, [projects, currentProjectId, currentProject])

  // Helper functions for filters
  const updateFilters = useCallback(
    (updatedFilters: ProjectFilters) => {
      setLocalFilters(updatedFilters)
      setStoreFilters(updatedFilters)
    },
    [setStoreFilters]
  )

  // Optimized refresh function that preserves the current project
  const refreshCarousel = useCallback(
    (page = pagination.page, forceRefresh = false) => {
      const projectIdToKeep = currentProjectId

      // Always fetch from server when forceRefresh is true
      if (forceRefresh) {
        return fetchProjects(filters, page, pagination.pageSize).then(() => {
          if (projectIdToKeep) {
            setCurrentProjectId(projectIdToKeep)
          }
        })
      }

      return fetchProjects(filters, page, pagination.pageSize).then(() => {
        if (projectIdToKeep) {
          setCurrentProjectId(projectIdToKeep)
        }
      })
    },
    [fetchProjects, pagination.pageSize, currentProjectId, filters, pagination.page]
  )

  // Search functionality
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleSearch = useCallback(() => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    // Force refresh when search term changes
    refreshCarousel(FIRST_PAGE, true)
  }, [filters, searchTerm, updateFilters, refreshCarousel])

  // Sorting functionality
  const handleSortChange = useCallback(
    (field: string, order: 'asc' | 'desc') => {
      const updatedFilters = {
        ...filters,
        sortBy: field || undefined,
        sortOrder: order || undefined
      }
      updateFilters(updatedFilters)
      // Force refresh when sorting changes
      refreshCarousel(FIRST_PAGE, true)
    },
    [filters, updateFilters, refreshCarousel]
  )

  // Filter functionality
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      const updatedFilters = {
        ...tempFilters,
        [name]: value
      } as Partial<ProjectFilters>
      setTempFilters(updatedFilters)
    },
    [tempFilters]
  )

  const handleApplyFilters = useCallback(() => {
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

    // Preserve sorting when applying filters
    if (filters.sortBy) {
      cleanedFilters.sortBy = filters.sortBy
      cleanedFilters.sortOrder = filters.sortOrder
    }

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    // Force refresh when filters are applied
    refreshCarousel(FIRST_PAGE, true)
  }, [tempFilters, filters, updateFilters, refreshCarousel])

  const resetFilters = useCallback(() => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    // Force refresh when filters are reset
    refreshCarousel(FIRST_PAGE, true)
  }, [updateFilters, refreshCarousel])

  // Project CRUD operations
  const handleAddProject = useCallback(
    async (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        await addProject(project as Project)
        setAddDialogOpen(false)
        refreshCarousel()
        toast.success('Project added successfully')
      } catch (err) {
        console.error('Error adding project:', err)
        toast.error('Failed to add project')
      }
    },
    [addProject, refreshCarousel]
  )

  const handleEditProject = useCallback(
    async (project: Project) => {
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
    },
    [updateProject, refreshCarousel]
  )

  const handleInitiateDelete = useCallback((project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
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
  }, [projectToDelete, deleteProject, refreshCarousel])

  // Carousel management
  const handleCarouselChange = useCallback(
    (api: CarouselApi | null) => {
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
    },
    [projects]
  )

  // Handler for worker management
  const handleWorkerManagementClose = () => {
    refreshCarousel()
  }

  // Handler for opening add project dialog
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true)
  }

  // Handler for managing workers
  const handleManageWorkers = () => {
    setWorkerDialogOpen(true)
  }

  return (
    <>
      <PageTitle>Projects</PageTitle>
      {/* Search and Filter Toolbar */}
      <ProjectFiltersBar
        searchTerm={searchTerm}
        filters={filters}
        tempFilters={tempFilters}
        filterPopoverOpen={filterPopoverOpen}
        loadingState={loadingState}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={resetFilters}
        onFilterPopoverChange={setFilterPopoverOpen}
        onAddProject={handleOpenAddDialog}
        onManageWorkers={handleManageWorkers}
        currentProjectName={currentProject?.name}
        onSortChange={handleSortChange}
      />
      <div className='mx-auto my-4 max-w-screen-xl space-y-8'>
        {/* Project Carousel */}
        <ProjectCarousel
          projects={projects}
          loadingState={loadingState}
          onEditProject={project => {
            setSelectedProject(project)
            setEditDialogOpen(true)
          }}
          onDeleteProject={handleInitiateDelete}
          carouselApiCallback={handleCarouselChange}
        />
      </div>

      {/* Project Details (map and workers) - only show if there's a current project */}
      {currentProject && <ProjectDetails project={currentProject} />}

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

      {/* Add Project Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Create a new project in the database.</DialogDescription>
          </DialogHeader>
          <AddProjectForm onAddProject={project => handleAddProject(project as Project)} />
        </DialogContent>
      </Dialog>

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
    </>
  )
}
