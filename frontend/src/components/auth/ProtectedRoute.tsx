import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'cliente' | 'arquitecto' | 'moderador'
  redirectTo?: string
}

/**
 * ProtectedRoute Component
 * 
 * Protege rutas verificando autenticación y rol del usuario.
 * 
 * @param children - Componente a renderizar si tiene acceso
 * @param requiredRole - Rol requerido para acceder (opcional)
 * @param redirectTo - Ruta de redirección personalizada (default: '/login')
 */
export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <LoadingSpinner />
      </div>
    )
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.rol !== requiredRole) {
    // Redirigir a home si no tiene el rol correcto
    return <Navigate to="/" replace />
  }

  // Renderizar children si pasa todas las validaciones
  return <>{children}</>
}

export default ProtectedRoute
