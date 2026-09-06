import { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'
import { logger } from '../utils/logger'
import { USER_ROLES } from '../config/constants'
import { loginUsuario, logoutUsuario } from '../services/api/auth/authService'

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  foto_perfil?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: Partial<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        logger.info('Sesión restaurada desde localStorage')
      } catch (error) {
        logger.error('Error al parsear datos de usuario', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      logger.info('Intento de login', { email })
      
      // Llamada real a la API
      const response = await loginUsuario({ email, password })
      
      if (response.usuario && response.token) {
        const userData: User = {
          id: response.usuario.id,
          email: response.usuario.email,
          nombre: response.usuario.nombre,
          apellido: response.usuario.apellido,
          rol: response.usuario.rol,
          foto_perfil: response.usuario.foto_perfil || undefined
        }
        
        setUser(userData)
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        logger.info('Login exitoso', { 
          userId: userData.id, 
          rol: userData.rol,
          nombre: userData.nombre 
        })
      } else {
        throw new Error('Respuesta de login inválida')
      }
      
    } catch (error: any) {
      // Evitar imprimir trazas completas para errores esperados (401/403)
      const status = error?.response?.status
      // Para errores de autenticación/permiso esperados no logueamos la traza completa
      if (status === 401 || status === 403) {
        // Intencionalmente silencioso para evitar ruido en consola durante intentos de login fallidos
      } else {
        logger.error('Error en login', error)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      logger.info('Cerrando sesión', { userId: user?.id })
      
      // Intentar cerrar sesión en el servidor
      await logoutUsuario()
      
    } catch (error) {
      logger.error('Error al cerrar sesión en servidor', error)
      // Continuar con el logout local aunque falle en servidor
    } finally {
      // Limpiar estado local
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  const register = async (userData: Partial<User>) => {
    try {
      setIsLoading(true)
      
      // TODO: Implementar llamada real a API
      // const response = await authService.register(userData)
      // setUser(response.user)
      // localStorage.setItem('auth_token', response.token)
      // localStorage.setItem('user_data', JSON.stringify(response.user))
      
      logger.info('Intento de registro', { email: userData.email })
      
    } catch (error) {
      logger.error('Error en registro', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
