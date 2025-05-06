import PageTitle from '@/components/page-title'
import AddProjectForm from '@/components/projects/project-add-form'
import EditProjectForm from '@/components/projects/project-edit-form'
import ProjectWorkersManagementDialog from '@/components/projects/project-workers-management-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useProjectsManagement } from '@/hooks/use-projects-management'
import ProjectCarousel from '@/components/projects/project-carousel'
import ProjectDetails from '@/components/projects/project-details'
import ProjectFiltersBar from '@/components/projects/project-filters'

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
    handleInitiateDelete,
    handleConfirmDelete,

    // Carousel
    refreshCarousel,
    handleCarouselChange
  } = useProjectsManagement()

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
      <div className='space-y-8'>
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
        />

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
      </div>
    </>
  )
}
