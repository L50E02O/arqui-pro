import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Hook personalizado para acceder al contexto de autenticación
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth()
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />
 *   }
 *   
 *   return <div>Welcome {user.nombre}</div>
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
