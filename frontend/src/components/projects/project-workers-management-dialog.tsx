import { useEffect, useState, useCallback, useRef } from 'react'
import { Project, Worker } from '@/services/types'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { projectsService } from '@/services/projects.service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Users, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [loading, setLoading] = useState(false)
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([])
  const [availableWorkersTotal, setAvailableWorkersTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [localProject, setLocalProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('assigned')
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
  const loadAvailableWorkers = useCallback(
    async (page: number) => {
      if (!open || !localProject?.id) return

      try {
        setLoading(true)
        console.log(`Loading page ${page} of available workers`)
        const response = await projectsService.getAvailableWorkers(localProject.id, {
          page,
          pageSize,
          search: searchTerm
        })
        setAvailableWorkers(response.data || [])

        // The API returns all workers count, but we need available workers count
        // When no search is active, we can count how many workers are not assigned to this project
        if (!searchTerm) {
          const availableCount = response.total - (localProject.workers?.length || 0)
          setAvailableWorkersTotal(Math.max(0, availableCount))
        } else {
          // For searches, use the length of returned data
          setAvailableWorkersTotal(response.data?.length || 0)
        }

        setCurrentPage(page)
      } catch (err) {
        console.error('Error loading available workers:', err)
        toast.error('Failed to load available workers')
      } finally {
        setLoading(false)
      }
    },
    [open, localProject?.id, localProject?.workers?.length, pageSize, searchTerm]
  )

  useEffect(() => {
    if (open && localProject?.id) {
      loadAvailableWorkers(1) // Reset to first page when dialog opens
    }
  }, [open, localProject?.id, loadAvailableWorkers])

  // Handle worker assignment
  const handleAssignWorker = async (worker: Worker) => {
    if (!localProject?.id) return

    try {
      // Update via API
      const updatedProject = await projectsService.assignWorker(localProject.id, worker.id)
      toast.success(`${worker.name} has been assigned to the project`)

      // Mark that changes were made
      hasChanges.current = true

      // Update the available workers list
      await loadAvailableWorkers(currentPage)

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
  const handleUnassignWorker = async (worker: Worker) => {
    if (!localProject?.id) return

    try {
      // Update via API
      const updatedProject = await projectsService.unassignWorker(localProject.id, worker.id)
      toast.success(`${worker.name} has been unassigned from the project`)

      // Mark that changes were made
      hasChanges.current = true

      // Update the available workers list
      await loadAvailableWorkers(currentPage)

      // Update local project with returned project data
      setLocalProject(updatedProject)

      // Call the callback if provided
      onWorkerUnassigned?.()
    } catch (err) {
      console.error('Error unassigning worker:', err)
      toast.error('Failed to unassign worker from project')
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      (newPage > Math.ceil(availableWorkersTotal / pageSize) && availableWorkersTotal > 0)
    ) {
      return
    }
    loadAvailableWorkers(newPage)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open && localProject?.id) {
        loadAvailableWorkers(1)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, open, localProject?.id, loadAvailableWorkers])

  // Don't show the dialog if no project is selected
  if (!localProject) {
    return null
  }

  // Count assigned workers
  const assignedWorkersCount = localProject.workers?.length || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='flex max-h-[80vh] max-w-7xl flex-col overflow-hidden'>
        <DialogHeader className='border-b py-2'>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Users className='h-5 w-5' />
            Team Management
          </DialogTitle>
          <DialogDescription>
            Manage workers for <span className='font-semibold'>{localProject.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='mt-1 flex flex-col gap-4 overflow-auto p-2'>
          <Tabs
            defaultValue='assigned'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='mb-1 grid w-full grid-cols-2'>
              <TabsTrigger value='assigned'>
                Assigned Workers <Badge className='bg-primary ml-2'>{assignedWorkersCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value='available'>
                Available Workers <Badge className='ml-2'>{availableWorkersTotal}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='assigned' className='mt-0'>
              <Card>
                <CardHeader className='py-2'>
                  <CardTitle className='flex items-center gap-2'>
                    <UserMinus className='h-4 w-4' /> Current Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='rounded-md border'>
                    <div className='max-h-[300px] overflow-auto'>
                      <table className='w-full'>
                        <thead className='bg-background sticky top-0 z-10'>
                          <tr className='border-b'>
                            <th className='px-4 py-2 text-left font-medium'>Name</th>
                            <th className='px-4 py-2 text-left font-medium'>Position</th>
                            <th className='w-32 px-4 py-2 text-right font-medium'>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!localProject.workers || localProject.workers.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className='text-muted-foreground px-4 py-6 text-center'
                              >
                                No workers assigned to this project yet
                              </td>
                            </tr>
                          ) : (
                            localProject.workers.map(worker => (
                              <tr key={worker.id} className='hover:bg-muted/50 border-b'>
                                <td className='px-4 py-2 font-medium'>{worker.name}</td>
                                <td className='px-4 py-2'>{worker.position}</td>
                                <td className='px-4 py-2 text-right'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleUnassignWorker(worker)}
                                    className='flex items-center gap-1'
                                  >
                                    <UserMinus className='h-4 w-4' />
                                    Unassign
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='available' className='mt-0'>
              <Card>
                <CardHeader className='py-2'>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <UserPlus className='h-4 w-4' /> Available Workers
                    </div>
                    <div className='relative w-64'>
                      <Search className='text-muted-foreground absolute left-2 top-2 h-4 w-4' />
                      <Input
                        placeholder='Search workers...'
                        value={searchTerm}
                        onChange={handleSearch}
                        className='pl-8'
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='rounded-md border'>
                    <div className='max-h-[300px] overflow-auto'>
                      <table className='w-full'>
                        <thead className='bg-background sticky top-0 z-10'>
                          <tr className='border-b'>
                            <th className='px-4 py-2 text-left font-medium'>Name</th>
                            <th className='px-4 py-2 text-left font-medium'>Position</th>
                            <th className='w-32 px-4 py-2 text-right font-medium'>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={3} className='px-4 py-8 text-center'>
                                <div className='flex items-center justify-center gap-2'>
                                  <Loader2 className='h-5 w-5 animate-spin' />
                                  Loading available workers...
                                </div>
                              </td>
                            </tr>
                          ) : availableWorkers.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className='text-muted-foreground px-4 py-6 text-center'
                              >
                                {searchTerm
                                  ? 'No workers match your search criteria'
                                  : 'No available workers found'}
                              </td>
                            </tr>
                          ) : (
                            availableWorkers.map(worker => (
                              <tr key={worker.id} className='hover:bg-muted/50 border-b'>
                                <td className='px-4 py-2 font-medium'>{worker.name}</td>
                                <td className='px-4 py-2'>{worker.position}</td>
                                <td className='px-4 py-2 text-right'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleAssignWorker(worker)}
                                    className='text-primary hover:text-primary flex items-center gap-1'
                                  >
                                    <UserPlus className='h-4 w-4' />
                                    Assign
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  <div className='mx-2 mt-1 flex items-center justify-between'>
                    <div className='text-muted-foreground text-sm'>
                      {availableWorkersTotal === 0
                        ? 'No results'
                        : `Showing ${Math.min((currentPage - 1) * pageSize + 1, availableWorkersTotal)}-${Math.min(
                            currentPage * pageSize,
                            availableWorkersTotal
                          )} of ${availableWorkersTotal} available workers`}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                      >
                        Previous
                      </Button>
                      <div className='text-sm font-medium'>
                        Page {currentPage} of{' '}
                        {availableWorkersTotal === 0
                          ? 1
                          : Math.max(1, Math.ceil(availableWorkersTotal / pageSize))}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage * pageSize >= availableWorkersTotal || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className='mt-auto flex justify-end border-t py-2'>
          <Button variant='default' onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectWorkersManagementDialog
