import axios from 'axios'
import { API_CONFIG, getAuthToken } from '../../config/api.config'

const axiosInstance = axios.create({
  baseURL: API_CONFIG.REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Crear una instancia pública (sin interceptores) para endpoints que no requieren autenticación
export const axiosPublic = axios.create({
  baseURL: API_CONFIG.REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para agregar token y user ID
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Agregar X-User-ID para validaciones de seguridad en el backend
    const userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.id) {
          config.headers['X-User-ID'] = user.id
        }
      } catch (error) {
        // parsing error ignored intentionally to avoid noisy console output
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || '';
      // Solo desloguear si el token es realmente inválido o expirado
      if (errorMessage.includes('Token inválido') || 
          errorMessage.includes('Token expirado') || 
          errorMessage.includes('Token revocado') ||
          errorMessage.includes('Token de autorización requerido')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
