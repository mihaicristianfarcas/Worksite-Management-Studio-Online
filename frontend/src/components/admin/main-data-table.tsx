import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'

import { useCallback, useEffect, useState } from 'react'
import { User } from '@/api/model/user'
import { adminService } from '@/api/services/admin.service'
import { toast } from 'sonner'

// Admin components
import { useAdminColumns } from '@/components/admin/admin-columns'
import { AdminTable } from '@/components/admin/admin-table'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { AdminFiltersBar } from '@/components/admin/admin-filters-bar'

// Dialogs
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ActivityLog } from '@/api/model/admin'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

// Get badge color for log type
const getLogTypeBadge = (logType: string) => {
  switch (logType) {
    case 'CREATE':
      return 'default'
    case 'UPDATE':
      return 'secondary'
    case 'DELETE':
      return 'destructive'
    case 'LOGIN':
      return 'outline'
    case 'LOGOUT':
      return 'outline'
    case 'REGISTER':
      return 'default'
    default:
      return 'outline'
  }
}

// Format a date string for display
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

interface AdminDataTableProps {
  // Optional props for customization
  showFilters?: boolean
  showPagination?: boolean
  showActions?: boolean
  title?: string
}

export function AdminDataTable({
  showFilters = true,
  showPagination = true,
  showActions = true,
  title
}: AdminDataTableProps) {
  const FIRST_PAGE = 1
  const PAGE_SIZE = 10
  const [mounted, setMounted] = useState(false)

  // User data state
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(FIRST_PAGE)
  const [pageSize] = useState(PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Activity log state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userActivityOpen, setUserActivityOpen] = useState(false)
  const [userActivityLoading, setUserActivityLoading] = useState(false)
  const [userActivity, setUserActivity] = useState<ActivityLog[]>([])
  const [activityTotal, setActivityTotal] = useState(0)
  const [activityPage, setActivityPage] = useState(FIRST_PAGE)
  const [activityPageSize] = useState(PAGE_SIZE)

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [globalFilter] = useState('')

  // User handlers
  const handleToggleActive = useCallback(async (user: User) => {
    try {
      await adminService.updateUserStatus(user.id, !user.active)
      toast.success(`User ${user.active ? 'deactivated' : 'activated'} successfully`)
      // Update user in the local state
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === user.id ? { ...u, active: !u.active } : u))
      )
    } catch (error) {
      toast.error('Failed to update user status')
      console.error(error)
    }
  }, [])

  const handleRoleChange = useCallback(async (user: User, newRole: string) => {
    try {
      await adminService.updateUserRole(user.id, newRole)
      toast.success(`User role updated to ${newRole}`)
      // Update user in the local state
      setUsers(prevUsers => prevUsers.map(u => (u.id === user.id ? { ...u, role: newRole } : u)))
    } catch (error) {
      toast.error('Failed to update user role')
      console.error(error)
    }
  }, [])

  // Activity log handlers
  const handleViewActivity = useCallback(async (user: User) => {
    setSelectedUser(user)
    setUserActivityOpen(true)
    setActivityPage(FIRST_PAGE) // Reset to first page
    await loadUserActivity(user.id, 1)
  }, [])

  const loadUserActivity = async (userId: number, page: number) => {
    try {
      setUserActivityLoading(true)
      const response = await adminService.getUserActivity(userId, page, activityPageSize)
      setUserActivity(response.activity)
      setActivityTotal(response.total)
      setActivityPage(page)
    } catch (error) {
      toast.error('Failed to load user activity')
      console.error(error)
    } finally {
      setUserActivityLoading(false)
    }
  }

  const handleActivityPageChange = (newPage: number) => {
    if (selectedUser) {
      setActivityPage(newPage)
      loadUserActivity(selectedUser.id, newPage)
    }
  }

  // Load users on component mount and when dependencies change
  useEffect(() => {
    if (mounted) {
      loadUsers()
    }
  }, [page, searchQuery, mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUsers(page, pageSize, searchQuery)
      setUsers(response.data)
      setTotal(response.total)
    } catch (error) {
      toast.error('Failed to load users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const handleSearch = useCallback(() => {
    setSearchQuery(search)
    setPage(FIRST_PAGE) // Reset to first page on new search
  }, [search])

  const handleRefresh = useCallback(() => {
    setSearch('')
    setSearchQuery('')
    setSorting([])
    setColumnVisibility({})
    setPage(FIRST_PAGE)
    loadUsers()
  }, [])

  // Define columns for the user table
  const columns = useAdminColumns({
    onViewActivity: handleViewActivity,
    onToggleActive: handleToggleActive,
    onRoleChange: handleRoleChange,
    showActions
  })

  // Create table instance
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      globalFilter
    }
  })

  // Only keep totalActivityPages for the activity log
  const totalActivityPages = Math.ceil(activityTotal / activityPageSize)

  // Don't render until mounted
  if (!mounted) {
    return null
  }

  return (
    <div className='space-y-4'>
      {title && <h3 className='text-lg font-semibold'>{title}</h3>}

      {/* Filters Bar */}
      {showFilters && (
        <AdminFiltersBar
          columns={table.getAllColumns()}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          searchTerm={search}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          isLoading={loading}
        />
      )}

      {/* Users Table */}
      <AdminTable table={table} columns={columns} isLoading={loading} />

      {/* Pagination */}
      {showPagination && (
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          users={users}
        />
      )}

      {/* User Activity Dialog */}
      <Dialog open={userActivityOpen} onOpenChange={setUserActivityOpen}>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>User Activity: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2 rounded border p-4'>
              <h3 className='font-medium'>User Information</h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div>Username: {selectedUser?.username}</div>
                <div>Email: {selectedUser?.email}</div>
                <div>Role: {selectedUser?.role}</div>
                <div>Status: {selectedUser?.active ? 'Active' : 'Inactive'}</div>
                <div>Last Login: {formatDate(selectedUser?.last_login)}</div>
                <div>Created: {formatDate(selectedUser?.created_at)}</div>
              </div>
            </div>
            <div className='rounded border p-4'>
              <h3 className='mb-2 font-medium'>Activity Log</h3>

              {userActivityLoading ? (
                <div className='py-4 text-center'>Loading activity...</div>
              ) : userActivity.length > 0 ? (
                <>
                  <div className='max-h-96 overflow-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userActivity.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant={getLogTypeBadge(log.log_type)}>{log.log_type}</Badge>
                            </TableCell>
                            <TableCell>{log.entity_type}</TableCell>
                            <TableCell>{log.description}</TableCell>
                            <TableCell>
                              <div className='flex items-center'>
                                <Clock className='mr-1 h-3 w-3' />
                                {formatDate(log.created_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Activity Pagination */}
                  <div className='mt-4 flex items-center justify-between'>
                    <div>
                      Showing {userActivity.length} of {activityTotal} logs
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleActivityPageChange(Math.max(1, activityPage - 1))}
                        disabled={activityPage === 1 || userActivityLoading}
                      >
                        Previous
                      </Button>
                      <span className='flex items-center px-2 text-sm'>
                        Page {activityPage} of {totalActivityPages || 1}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleActivityPageChange(Math.min(totalActivityPages, activityPage + 1))
                        }
                        disabled={activityPage >= totalActivityPages || userActivityLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className='text-muted-foreground py-4 text-center italic'>
                  No activity logs found for this user.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
