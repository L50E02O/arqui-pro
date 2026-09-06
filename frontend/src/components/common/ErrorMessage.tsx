import { memo } from 'react'
import '../../styles/components.css'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  showIcon?: boolean
}

const ErrorMessage = memo(function ErrorMessage({ 
  title = '¡Ups! Algo salió mal',
  message, 
  onRetry,
  showIcon = true 
}: ErrorMessageProps) {
  return (
    <div className="error-message-container">
      {showIcon && <div className="error-icon">⚠️</div>}
      <h2 className="error-title">{title}</h2>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-retry-btn" aria-label="Reintentar">
          Reintentar
        </button>
      )}
    </div>
  )
})

export default ErrorMessage
