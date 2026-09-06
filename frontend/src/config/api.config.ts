// API Configuration
export const API_CONFIG = {
  REST_API_URL: import.meta.env.VITE_REST_API_URL || 'http://localhost:3000/api/v1',
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3006',
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token')
}
