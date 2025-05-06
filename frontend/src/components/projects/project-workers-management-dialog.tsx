import { useEffect, useState, useCallback, useRef } from 'react'
import { Project, Worker } from '@/api/types'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { projectsService } from '@/services/projects.service'

interface ProjectWorkersManagementDialogProps {
  project: Project | null
  onWorkerAssigned?: () => void
  onWorkerUnassigned?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * A dialog for managing workers assigned to a project
 * Allows assigning available workers and unassigning current workers
 */
const ProjectWorkersManagementDialog = ({
  project,
  onWorkerAssigned,
  onWorkerUnassigned,
  open: controlledOpen,
  onOpenChange
}: ProjectWorkersManagementDialogProps) => {
  // Local state
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([])
  const [localProject, setLocalProject] = useState<Project | null>(null)
  const hasChanges = useRef(false)

  // Use controlled or uncontrolled open state
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value)
    }

    // If dialog is closing and there were changes, notify parent
    if (!value && hasChanges.current) {
      hasChanges.current = false
    }

    onOpenChange?.(value)
  }

  // Keep track of the current project and create a local copy
  useEffect(() => {
    if (project) {
      setLocalProject(project)
    }
  }, [project])

  // Load available workers for the project
  const loadAvailableWorkers = useCallback(async () => {
    if (!open || !localProject?.id) return

    try {
      setLoading(true)
      const workers = await projectsService.getAvailableWorkers(localProject.id)
      setAvailableWorkers(workers)
    } catch (err) {
      console.error('Error loading available workers:', err)
      toast.error('Failed to load available workers')
    } finally {
      setLoading(false)
    }
  }, [open, localProject?.id])

  useEffect(() => {
    if (open && localProject?.id) {
      loadAvailableWorkers()
    }
  }, [open, localProject?.id, loadAvailableWorkers])

  // Handle worker assignment
  const handleAssignWorker = async (workerId: number) => {
    if (!localProject?.id) return

    try {
      // Update via API
      const updatedProject = await projectsService.assignWorker(localProject.id, workerId)
      toast.success('Worker assigned to project')

      // Mark that changes were made
      hasChanges.current = true

      // Update the available workers list
      await loadAvailableWorkers()

      // Update local project state with the returned project data
      setLocalProject(updatedProject)

      // Call the callback if provided
      onWorkerAssigned?.()
    } catch (err) {
      console.error('Error assigning worker:', err)
      toast.error('Failed to assign worker to project')
    }
  }

  // Handle worker unassignment
  const handleUnassignWorker = async (workerId: number) => {
    if (!localProject?.id) return

    try {
      // Update via API
      const updatedProject = await projectsService.unassignWorker(localProject.id, workerId)
      toast.success('Worker unassigned from project')

      // Mark that changes were made
      hasChanges.current = true

      // Update the available workers list
      await loadAvailableWorkers()

      // Update local project with returned project data
      setLocalProject(updatedProject)

      // Call the callback if provided
      onWorkerUnassigned?.()
    } catch (err) {
      console.error('Error unassigning worker:', err)
      toast.error('Failed to unassign worker from project')
    }
  }

  // Filter workers based on search term
  const filteredAvailableWorkers = availableWorkers.filter(
    worker =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAssignedWorkers =
    localProject?.workers?.filter(
      worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.position.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  // Don't show the dialog if no project is selected
  if (!localProject) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Manage Workers - {localProject.name}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Input
              placeholder='Search workers...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
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
              <h3 className='my-2 text-lg font-semibold'>Assigned Workers</h3>
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
                    {filteredAssignedWorkers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className='text-muted-foreground text-center'>
                          No workers assigned to this project
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignedWorkers.map(worker => (
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

export default ProjectWorkersManagementDialog
