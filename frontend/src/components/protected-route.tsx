import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

type ProtectedRouteProps = {
  children: ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading state while authentication is being checked
  if (isLoading) {
    return <div className='flex h-screen items-center justify-center'>Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/' replace />
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to='/dashboard' replace />
  }

  // Render children if authenticated and has required role
  return <>{children}</>
}
