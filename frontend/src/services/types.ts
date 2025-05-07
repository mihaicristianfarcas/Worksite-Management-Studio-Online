export type Project = {
  id: number
  name: string
  description: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string
  end_date?: string
  latitude?: number
  longitude?: number
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

export type Worker = {
  id: number
  name: string
  age: number
  position: string
  salary: number
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

export type User = {
  id: number
  username: string
  email: string
  role: string
  active: boolean
  last_login?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type PaginationParams = {
  page: number
  pageSize: number
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}
