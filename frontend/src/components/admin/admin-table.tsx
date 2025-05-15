import { flexRender, Table as TableInstance, ColumnDef } from '@tanstack/react-table'
import { User } from '@/api/model/user'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface AdminTableProps {
  table: TableInstance<User>
  columns: ColumnDef<User>[]
  isLoading: boolean
}

export function AdminTable({ table, columns, isLoading }: AdminTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className='text-center'
                  style={{ width: header.column.getSize ? `${header.column.getSize()}px` : 'auto' }}
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                Loading users...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                className='hover:bg-muted/30'
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize ? `${cell.column.getSize()}px` : 'auto' }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
