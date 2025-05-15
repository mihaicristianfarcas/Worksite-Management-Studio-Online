import { User } from './user'

export type ActivityLog = {
  id: number
  user_id: number
  username: string
  log_type: string
  entity_type: string
  entity_id?: number
  description: string
  created_at: string
}

export type UserActivityResponse = {
  user: User
  activity: ActivityLog[]
  total: number
  page: number
  pageSize: number
}

export type PaginatedUsersResponse = {
  data: User[]
  total: number
  page: number
  pageSize: number
}
