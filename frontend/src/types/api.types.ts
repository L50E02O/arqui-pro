// Generic API Response
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
    next_page: number | null
    prev_page: number | null
  }
}

// API Error
export interface ApiError {
  message: string
  errors?: {
    [field: string]: string[]
  }
  status: number
}

// Async State for Hooks
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

// Filtros Base
export interface FiltrosBase {
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Ordenamiento
export interface Ordenamiento {
  campo: string
  direccion: 'asc' | 'desc'
}

// Archivo Subida
export interface ArchivoSubida {
  file: File
  preview?: string
  uploading?: boolean
  progress?: number
  error?: string
}

// Query Params
export type QueryParams = Record<string, string | number | boolean | undefined>
