import { Project } from './project'

export type Worker = {
  id: number
  name: string
  age: number
  position: string
  salary: number
  user_id: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  projects?: Project[]
}

export type WorkerFilters = {
  position?: string
  minAge?: number
  maxAge?: number
  minSalary?: number
  maxSalary?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}
