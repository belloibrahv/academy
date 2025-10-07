import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ProtectedRouteProps } from '../types.ts'

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark-light">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && profile?.role !== role) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
