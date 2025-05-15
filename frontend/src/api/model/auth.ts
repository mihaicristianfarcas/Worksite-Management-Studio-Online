import { User } from './user'

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  role?: string
}

export type AuthResponse = {
  token: string
  user: User
}
