import { Worker } from '@/services/types'
import { Button } from '@/components/ui/button'

interface WorkersPaginationProps {
  page: number
  pageSize: number
  total: number
  selectedCount: number
  onPageChange: (page: number) => void
  workers: Worker[] | undefined
}

export function WorkersPagination({
  page,
  pageSize,
  total,
  selectedCount,
  onPageChange,
  workers = []
}: WorkersPaginationProps) {
  return (
    <div className='flex items-center justify-end space-x-2 py-4'>
      <div className='text-muted-foreground flex-1 text-sm'>
        {selectedCount} of {total} row(s) selected.
      </div>
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
          {total === 0 ? 'No workers found' : `Showing ${workers.length} of ${total} workers`}
        </span>
      </div>
    </div>
  )
}
