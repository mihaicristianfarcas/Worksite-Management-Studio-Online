import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '@/api/model/user'
import { authService } from '@/api/services/auth.service'
import { toast } from 'sonner'
import { LoginRequest, RegisterRequest } from '@/api/model/auth'

// Define the auth context type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {}
})

// Props type for the provider
type AuthProviderProps = {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
      toast.success('Login successful')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      const response = await authService.register(userData)
      setUser(response.user)
      toast.success('Registration successful')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
    toast.success('Logged out successfully')
  }

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext)
