import { Project } from '@/api/model/project'
import ProjectMap from './site-map'
import { MainWorkersDataTable } from '@/components/workers/main-data-table'

// Displays project details including the workers table and map
const ProjectDetails = ({ project }: { project: Project }) => {
  return (
    <div className='grid grid-cols-2 gap-8 space-y-8'>
      {/* Assigned Workers Table */}
      <MainWorkersDataTable
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
