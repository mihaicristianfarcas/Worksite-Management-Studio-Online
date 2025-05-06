import { useState, useCallback, useEffect } from 'react'
import { Project, ProjectFilters } from '@/api/types'
import { useProjectsStore } from '@/store/projects-store'
import { toast } from 'sonner'
import { type CarouselApi } from '@/components/ui/carousel'

/**
 * Custom hook for managing projects
 * Centralizes project management logic including search, filters, and CRUD operations
 */
export function useProjectsManagement() {
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
    refreshCarousel(FIRST_PAGE)
  }, [filters, searchTerm, updateFilters])

  // Filter functionality
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    refreshCarousel(FIRST_PAGE)
  }, [tempFilters, filters.search, updateFilters])

  const resetFilters = useCallback(() => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshCarousel(FIRST_PAGE)
  }, [updateFilters])

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
    [fetchProjects, pagination.pageSize, currentProjectId, filters, pagination.page]
  )

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

  return {
    // State
    projects,
    pagination,
    loadingState,
    currentProject,
    currentProjectId,
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
    setCurrentProject,
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
    handleInitiateDelete,
    handleConfirmDelete,

    // Carousel
    refreshCarousel,
    handleCarouselChange,
    FIRST_PAGE
  }
}
