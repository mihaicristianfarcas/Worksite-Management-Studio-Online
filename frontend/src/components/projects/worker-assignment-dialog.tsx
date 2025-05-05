import { useEffect, useState, useCallback, useMemo } from 'react'
import { Project, Worker } from '@/api/types'
import { useProjectsStore } from '@/store/projects-store'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

interface WorkerAssignmentDialogProps {
  project: Project
  onWorkerAssigned?: () => void
  onWorkerUnassigned?: () => void
}

const WorkerAssignmentDialog = ({
  project,
  onWorkerAssigned,
  onWorkerUnassigned
}: WorkerAssignmentDialogProps) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { assignWorker, unassignWorker, getAvailableWorkers } = useProjectsStore()
  const [loading, setLoading] = useState(false)
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([])

  // Memoize the filtered workers to prevent unnecessary recalculations
  const filteredAvailableWorkers = useMemo(() => {
    return availableWorkers.filter(
      worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [availableWorkers, searchTerm])

  // Memoize the assigned workers to prevent unnecessary recalculations
  const assignedWorkers = useMemo(() => {
    return project.workers || []
  }, [project.workers])

  const loadAvailableWorkers = useCallback(async () => {
    if (!open) return

    try {
      setLoading(true)
      const workers = await getAvailableWorkers(project.id)
      setAvailableWorkers(workers)
    } catch (err) {
      console.error('Error loading available workers:', err)
      toast.error('Failed to load available workers')
    } finally {
      setLoading(false)
    }
  }, [open, project.id, getAvailableWorkers])

  useEffect(() => {
    if (open) {
      loadAvailableWorkers()
    }
  }, [open, loadAvailableWorkers])

  const handleAssignWorker = async (workerId: number) => {
    try {
      await assignWorker(project.id, workerId)
      toast.success('Worker assigned to project')
      onWorkerAssigned?.()
      // Update the available workers list
      const workers = await getAvailableWorkers(project.id)
      setAvailableWorkers(workers)
    } catch (err) {
      console.error('Error assigning worker:', err)
      toast.error('Failed to assign worker to project')
    }
  }

  const handleUnassignWorker = async (workerId: number) => {
    try {
      await unassignWorker(project.id, workerId)
      toast.success('Worker unassigned from project')
      onWorkerUnassigned?.()
      // Update the available workers list
      const workers = await getAvailableWorkers(project.id)
      setAvailableWorkers(workers)
    } catch (err) {
      console.error('Error unassigning worker:', err)
      toast.error('Failed to unassign worker from project')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Manage Workers</Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Manage Workers - {project.name}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Input
              placeholder='Search workers...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Available Workers</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className='w-[100px]'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-center'>
                          <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                        </TableCell>
                      </TableRow>
                    ) : filteredAvailableWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-muted-foreground text-center'>
                          No available workers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAvailableWorkers.map(worker => (
                        <TableRow key={worker.id}>
                          <TableCell className='font-medium'>{worker.name}</TableCell>
                          <TableCell>{worker.position}</TableCell>
                          <TableCell>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleAssignWorker(worker.id)}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Assigned Workers</h3>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className='w-[100px]'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-muted-foreground text-center'>
                          No workers assigned to this project
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedWorkers.map(worker => (
                        <TableRow key={worker.id}>
                          <TableCell className='font-medium'>{worker.name}</TableCell>
                          <TableCell>{worker.position}</TableCell>
                          <TableCell>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleUnassignWorker(worker.id)}
                            >
                              Unassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WorkerAssignmentDialog
