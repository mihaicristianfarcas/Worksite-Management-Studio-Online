import { Worker } from './worker'

export type Project = {
  id: number
  name: string
  description: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string
  end_date?: string
  latitude?: number
  longitude?: number
  user_id: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  workers?: Worker[]
}

export type ProjectFilters = {
  name?: string
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
