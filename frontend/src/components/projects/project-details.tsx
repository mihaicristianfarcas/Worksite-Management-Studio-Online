import { Project } from '@/api/types'
import ProjectWorkersTable from '@/components/projects/assigned-workers-table'
import ProjectMap from '@/components/projects/site-map'

interface ProjectDetailsProps {
  project: Project
}

/**
 * Displays project details including the workers table and map
 */
const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  return (
    <div className='grid grid-cols-2 items-center justify-between gap-3 p-2'>
      <div className='space-y-4'>
        <h2 className='text-lg font-medium'>Assigned workers to {project.name}</h2>
        <ProjectWorkersTable project={project} />
      </div>
      <ProjectMap project={project} />
    </div>
  )
}

export default ProjectDetails
