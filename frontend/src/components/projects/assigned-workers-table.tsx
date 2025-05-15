import { Project } from '@/api/model/project'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const AssignedWorkersTable = ({ project }: { project: Project }) => {
  return (
    <div className='space-y-4 rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project.workers?.map(worker => (
            <TableRow key={worker.id}>
              <TableCell className='font-medium'>{worker.name}</TableCell>
              <TableCell>{worker.position}</TableCell>
            </TableRow>
          ))}
          {project.workers?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className='text-muted-foreground text-center'>
                No workers assigned to this project
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default AssignedWorkersTable
