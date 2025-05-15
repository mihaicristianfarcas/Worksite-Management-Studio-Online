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

// Admin service types
