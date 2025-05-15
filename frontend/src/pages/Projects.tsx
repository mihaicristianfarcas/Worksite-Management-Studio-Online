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
import { Project } from '@/api/model/project'
import { useState, useEffect } from 'react'
import { useProjectsStore } from '@/api/store/projects-store'
import { toast } from 'sonner'
import { type CarouselApi } from '@/components/ui/carousel'
import { ProjectSchema } from '@/lib/schemas'
import { z } from 'zod'
import { projectsService } from '@/api/services/projects.service'

// Type for project form values
type ProjectFormValues = z.infer<typeof ProjectSchema>

export default function Projects() {
  // Store state
  const {
    projects,
    pagination,
    loadingState,
    fetchProjects,
    refreshProjects,
    setFilters,
    filters: storeFilters,
    addProject,
    updateProject,
    deleteProject
  } = useProjectsStore()

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false)

  // Load projects on mount
  useEffect(() => {
    fetchProjects(storeFilters, pagination.page, pagination.pageSize)
  }, [storeFilters])

  // Set initial current project when projects load
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0])
    }
  }, [projects, currentProject])

  // Refresh the current project data (used when worker assignments change)
  const refreshCurrentProject = async () => {
    if (currentProject?.id) {
      try {
        const updatedProject = await projectsService.getById(currentProject.id)
        // Update currentProject with fresh data from server
        setCurrentProject(updatedProject)
      } catch (err) {
        console.error('Error refreshing project data:', err)
      }
    }
  }

  // Search functionality
  const handleSearch = () => {
    const newFilters = {
      ...storeFilters,
      search: searchTerm.trim() || undefined
    }
    setFilters(newFilters)
    fetchProjects(newFilters, 1, pagination.pageSize)
  }

  // Sorting functionality
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    const newFilters = {
      ...storeFilters,
      sortBy: field,
      sortOrder: order
    }
    setFilters(newFilters)
    fetchProjects(newFilters, 1, pagination.pageSize)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFilters({})
    refreshProjects()
  }

  // Project CRUD operations
  const handleAddProject = async (
    project: Omit<ProjectFormValues, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => {
    try {
      await addProject(project as Project)
      setAddDialogOpen(false)
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
      toast.success('Project updated successfully')
    } catch (err) {
      console.error('Error updating project:', err)
      toast.error('Failed to update project')
    }
  }

  const handleInitiateDelete = (project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id)
        toast.success('Project deleted successfully')
      } catch (err) {
        console.error('Error deleting project:', err)
        toast.error('Failed to delete project')
      }
    }
    setDeleteConfirmOpen(false)
    setProjectToDelete(null)
  }

  // Handle worker dialog close
  const handleWorkerDialogChange = (open: boolean) => {
    setWorkerDialogOpen(open)

    // When the dialog closes, refresh the current project to update the workers list
    if (!open) {
      refreshCurrentProject()
    }
  }

  // Carousel management
  const handleCarouselChange = (api: CarouselApi | null) => {
    if (!api) return

    api.on('select', () => {
      const selectedIndex = api.selectedScrollSnap()
      if (projects[selectedIndex]) {
        setCurrentProject(projects[selectedIndex])
      }
    })
  }

  return (
    <>
      <PageTitle>Projects</PageTitle>

      {/* Search and Filter Toolbar */}
      <ProjectFiltersBar
        searchTerm={searchTerm}
        filters={storeFilters}
        loadingState={loadingState}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        onResetFilters={resetFilters}
        onAddProject={() => setAddDialogOpen(true)}
        onManageWorkers={() => setWorkerDialogOpen(true)}
        currentProjectName={currentProject?.name}
        onSortChange={handleSortChange}
      />

      {/* Project Carousel */}
      <div className='mx-auto my-4 max-w-screen-xl space-y-8'>
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

      {/* Project Details */}
      {currentProject && <ProjectDetails project={currentProject} />}

      {/* Worker Assignment Dialog */}
      <ProjectWorkersManagementDialog
        project={currentProject}
        open={workerDialogOpen}
        onOpenChange={handleWorkerDialogChange}
      />

      {/* Add Project Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Create a new project in the database.</DialogDescription>
          </DialogHeader>
          <AddProjectForm onAddProject={handleAddProject} />
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
