import { useState, useEffect } from 'react'
import { adminService } from '@/services/admin.service'
import { User } from '@/services/types'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Custom Switch component since @/components/ui/switch doesn't exist
const Switch = ({
  checked,
  onCheckedChange
}: {
  checked: boolean
  onCheckedChange: () => void
}) => (
  <div
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primary' : 'bg-input'
    }`}
    onClick={onCheckedChange}
  >
    <span
      className={`bg-background inline-block h-4 w-4 transform rounded-full transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </div>
)

const Admin = () => {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userActivityOpen, setUserActivityOpen] = useState(false)

  // Load users on component mount and when pagination/search changes
  useEffect(() => {
    loadUsers()
  }, [page, searchQuery])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(search)
    setPage(1) // Reset to first page on new search
  }

  const handleToggleActive = async (user: User) => {
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
  }

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await adminService.updateUserRole(user.id, newRole)
      toast.success(`User role updated to ${newRole}`)
      // Update user in the local state
      setUsers(prevUsers => prevUsers.map(u => (u.id === user.id ? { ...u, role: newRole } : u)))
    } catch (error) {
      toast.error('Failed to update user role')
      console.error(error)
    }
  }

  const handleViewActivity = (user: User) => {
    setSelectedUser(user)
    setUserActivityOpen(true)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className='container py-10'>
      <h1 className='mb-6 text-2xl font-bold'>Admin Dashboard</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className='mb-6 flex gap-2'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4' />
          <Input
            type='text'
            placeholder='Search users by username or email...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>
        <Button type='submit' disabled={loading}>
          Search
        </Button>
      </form>

      {/* Users Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={value => handleRoleChange(user, value)}>
                    <SelectTrigger className='rounded-md'>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='user'>User</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      checked={user.active}
                      onCheckedChange={() => handleToggleActive(user)}
                    />
                    <Badge variant={user.active ? 'default' : 'destructive'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  <Button variant='outline' size='sm' onClick={() => handleViewActivity(user)}>
                    View Activity
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className='py-4 text-center'>
                  {loading ? 'Loading users...' : 'No users found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='mt-4 flex items-center justify-between'>
        <div>
          Showing {users.length} of {total} users
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className='flex items-center px-2'>
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant='outline'
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* User Activity Dialog */}
      <Dialog open={userActivityOpen} onOpenChange={setUserActivityOpen}>
        <DialogContent className='sm:max-w-[625px]'>
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
                <div>
                  Last Login:{' '}
                  {selectedUser?.last_login
                    ? new Date(selectedUser.last_login).toLocaleString()
                    : 'Never'}
                </div>
                <div>
                  Created:{' '}
                  {selectedUser?.created_at
                    ? new Date(selectedUser.created_at).toLocaleString()
                    : 'Unknown'}
                </div>
              </div>
            </div>
            <div className='rounded border p-4'>
              <h3 className='mb-2 font-medium'>Activity Log</h3>
              <p className='text-muted-foreground italic'>
                Activity logging coming soon. This will track user actions in the system.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Admin
