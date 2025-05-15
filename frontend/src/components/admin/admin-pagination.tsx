import { User } from '@/api/model/user'
import { Button } from '@/components/ui/button'

interface AdminPaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  users: User[] | undefined
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
  users = []
}: AdminPaginationProps) {
  return (
    <div className='flex items-center justify-end space-x-2 py-4'>
      <div className='text-muted-foreground flex-1 text-sm'>Total: {total} user(s)</div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || total === 0}
        >
          Previous
        </Button>
        <span className='text-muted-foreground text-sm'>
          {total === 0
            ? 'No results'
            : `Page ${page} of ${Math.max(1, Math.ceil(total / pageSize))}`}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(page + 1)}
          disabled={page * pageSize >= total || total === 0}
        >
          Next
        </Button>
        <span className='text-muted-foreground ml-2 text-sm'>
          {total === 0 ? 'No users found' : `Showing ${users.length} of ${total} users`}
        </span>
      </div>
    </div>
  )
}
