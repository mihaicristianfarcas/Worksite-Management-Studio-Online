import { Project } from '@/services/types'
import ProjectMap from './site-map'
import { WorkersDataTable } from '@/components/workers/data-table'

interface ProjectDetailsProps {
  project: Project
}

/**
 * Displays project details including the workers table and map
 */
const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  return (
    <div className='flex flex-row justify-center gap-8 space-y-8'>
      {/* Assigned Workers Table */}
      <WorkersDataTable
        initialWorkers={project.workers}
        showFilters={false}
        showPagination={false}
        showActions={false}
        title='Assigned Workers'
      />

      {/* Project Map */}
      <ProjectMap project={project} />
    </div>
  )
}

export default ProjectDetails
