import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  Row,
  Table as TableInstance,
  Column
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCcwDot,
  Search
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

// Project-specific components
import AddProjectForm from '@/components/projects/project-add-form'
import EditProjectForm from '@/components/projects/project-edit-form'

// API and store
import { Project, ProjectFilters } from '@/api/projects-api'
import { useProjectsStore } from '@/store/projects-store'

export function ProjectsDataTable() {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [filters, setFilters] = React.useState<ProjectFilters>({})
  const [tempFilters, setTempFilters] = React.useState<ProjectFilters>({})
  const [searchTerm, setSearchTerm] = React.useState('')

  // UI state
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null)
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)

  // Get data and methods from store
  const {
    projects,
    loadingState,
    pagination,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    deleteProjects,
    setFilters: setStoreFilters
  } = useProjectsStore()

  // Fetch projects on mount and when dependencies change
  React.useEffect(() => {
    fetchProjects(filters, pagination.page, pagination.pageSize)
  }, [fetchProjects, filters, pagination.page, pagination.pageSize])

  // Define table columns
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }: { table: TableInstance<Project> }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
            className='mx-auto'
          />
        ),
        cell: ({ row }: { row: Row<Project> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='mx-auto'
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50
      },
      {
        accessorKey: 'name',
        header: ({ column }: { column: Column<Project> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Name
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Project> }) => (
          <div className='text-center capitalize'>{row.getValue('name')}</div>
        ),
        size: 200
      },
      {
        accessorKey: 'description',
        header: ({ column }: { column: Column<Project> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Description
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Project> }) => (
          <div className='text-center'>{row.getValue('description')}</div>
        ),
        size: 300
      },
      {
        accessorKey: 'status',
        header: ({ column }: { column: Column<Project> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Status
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Project> }) => (
          <div className='text-center capitalize'>{row.getValue('status')}</div>
        ),
        size: 150
      },
      {
        accessorKey: 'start_date',
        header: ({ column }: { column: Column<Project> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            Start Date
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Project> }) => {
          const date = new Date(row.getValue('start_date'))
          return <div className='text-center'>{date.toLocaleDateString()}</div>
        },
        size: 150
      },
      {
        accessorKey: 'end_date',
        header: ({ column }: { column: Column<Project> }) => (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='w-full justify-center'
          >
            End Date
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        ),
        cell: ({ row }: { row: Row<Project> }) => {
          const date = row.getValue('end_date')
          return (
            <div className='text-center'>{date ? new Date(date).toLocaleDateString() : '-'}</div>
          )
        },
        size: 150
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }: { row: Row<Project> }) => {
          const project = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
                  Copy project ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteProject(project)}
                  className='text-red-600'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 80
      }
    ],
    []
  )

  // Create table instance
  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      return Object.values(row.original).some(value => {
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(nestedValue =>
            String(nestedValue).toLowerCase().includes(search)
          )
        }
        return String(value).toLowerCase().includes(search)
      })
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter
    }
  })

  // Simplified handler functions
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id)
      refreshTable()
    }
    setDeleteConfirmOpen(false)
  }

  const handleDeleteMultiple = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id)
    deleteProjects(selectedIds)
    setRowSelection({})
    refreshTable(1)
    setDeleteMultipleConfirmOpen(false)
  }

  const handleAddProject = async (project: Project) => {
    await addProject(project)
    setAddDialogOpen(false)
    refreshTable(1)
  }

  const handleEditProject = async (project: Project) => {
    await updateProject(project)
    setSelectedProject(null)
    refreshTable()
  }

  // Helper functions
  const updateFilters = (updatedFilters: ProjectFilters) => {
    setFilters(updatedFilters)
    setStoreFilters(updatedFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      search: searchTerm.trim() || undefined
    }
    updateFilters(updatedFilters)
    refreshTable(1)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedFilters = {
      ...tempFilters,
      [name]: value === '' ? undefined : value
    } as Partial<ProjectFilters>
    setTempFilters(updatedFilters)
  }

  const handleApplyFilters = () => {
    const cleanedFilters = Object.entries(tempFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        const typedKey = key as keyof ProjectFilters
        acc[typedKey] = value as ProjectFilters[keyof ProjectFilters]
      }
      return acc
    }, {} as ProjectFilters)

    updateFilters(cleanedFilters)
    setFilterPopoverOpen(false)
    refreshTable(1)
  }

  const resetFilters = () => {
    setTempFilters({})
    setSearchTerm('')
    updateFilters({})
    setFilterPopoverOpen(false)
    refreshTable(1)
  }

  const refreshTable = (page = pagination.page) => {
    fetchProjects(filters, page, pagination.pageSize)
  }

  // Filter fields for popover
  const filterFields = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'status', label: 'Status', type: 'text' }
  ]

  return (
    <>
      {/* Toolbar */}
      <div className='flex items-center py-4'>
        {/* Search */}
        <div className='flex max-w-sm items-center'>
          <Input
            placeholder='Search projects...'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className='rounded-r-none'
          />
          <Button variant='outline' className='rounded-l-none border-l-0' onClick={handleSearch}>
            <Search className='h-4 w-4' />
          </Button>
        </div>

        {/* Refresh button */}
        <Button
          className='ml-3'
          variant='outline'
          onClick={() => {
            resetFilters()
            setRowSelection({})
            setGlobalFilter('')
            setSorting([])
            setColumnVisibility({})
            refreshTable(1)
          }}
          disabled={loadingState === 'loading'}
        >
          <RefreshCcwDot className='h-4 w-4' />
        </Button>

        {/* Filter Button */}
        <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button className='ml-3' variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
              {Object.keys(filters).length > 0 && (
                <span className='bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs'>
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium leading-none'>Filter Projects</h4>
                <p className='text-muted-foreground text-sm'>
                  Set filters to find specific projects
                </p>
              </div>
              <div className='grid gap-2'>
                {filterFields.map(field => (
                  <div key={field.id} className='grid grid-cols-3 items-center gap-4'>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      className='col-span-2'
                      value={tempFilters[field.id as keyof ProjectFilters] || ''}
                      onChange={handleFilterChange}
                    />
                  </div>
                ))}
              </div>
              <div className='flex justify-between'>
                <Button variant='outline' onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add project dialog trigger */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='ml-3' variant='outline'>
              <Plus className='mr-2 h-4 w-4' />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a project</DialogTitle>
              <DialogDescription>Add a project to the database.</DialogDescription>
            </DialogHeader>
            <AddProjectForm
              onAddProject={async project => {
                await addProject(project as Project)
                setAddDialogOpen(false)
                refreshTable(1)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete selected button */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            className='ml-3 bg-red-600 hover:bg-red-700'
            onClick={() => setDeleteMultipleConfirmOpen(true)}
          >
            Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
          </Button>
        )}

        {/* Column visibility dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className='text-center'
                    style={{ width: `${header.column.getSize()}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className='hover:bg-muted/30'>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} style={{ width: `${cell.column.getSize()}px` }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of {pagination.total} row(s) selected.
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshTable(pagination.page - 1)}
            disabled={pagination.page <= 1 || pagination.total === 0}
          >
            Previous
          </Button>
          <span className='text-muted-foreground text-sm'>
            {pagination.total === 0
              ? 'No results'
              : `Page ${pagination.page} of ${Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}`}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshTable(pagination.page + 1)}
            disabled={
              pagination.page * pagination.pageSize >= pagination.total || pagination.total === 0
            }
          >
            Next
          </Button>
          <span className='text-muted-foreground ml-2 text-sm'>
            {pagination.total === 0
              ? 'No projects found'
              : `Showing ${projects.length} of ${pagination.total} projects`}
          </span>
        </div>
      </div>

      {/* Dialogs */}
      {/* Edit project dialog */}
      <Dialog open={!!selectedProject} onOpenChange={open => !open && setSelectedProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Modify project information.</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <EditProjectForm project={selectedProject} onEditProject={handleEditProject} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete project'
        description={`Are you sure you want to delete ${projectToDelete?.name}? This action cannot be undone.`}
        confirmText='Delete'
        variant='destructive'
      />

      <ConfirmationDialog
        isOpen={deleteMultipleConfirmOpen}
        onClose={() => setDeleteMultipleConfirmOpen(false)}
        onConfirm={handleDeleteMultiple}
        title='Delete multiple projects'
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} projects? This action cannot be undone.`}
        confirmText='Delete All'
        variant='destructive'
      />
    </>
  )
}
