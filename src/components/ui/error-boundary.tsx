'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <DefaultErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

// Default Error Fallback Component
interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 text-red-500 mb-6">
          <AlertTriangle className="h-full w-full" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Oops! Algo salió mal
        </h2>
        
        <p className="text-gray-600 mb-8">
          Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado y trabajamos para solucionarlo.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-8 text-left">
            <details className="bg-red-50 border border-red-200 rounded-lg p-4">
              <summary className="cursor-pointer text-red-800 font-medium mb-2">
                Detalles del error (solo en desarrollo)
              </summary>
              <pre className="text-xs text-red-700 overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleReload} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>

          {resetError && (
            <Button variant="ghost" onClick={resetError} className="text-sm">
              Intentar de nuevo
            </Button>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Error ID: {Date.now().toString(36)}</p>
          <p>Si el problema persiste, contacta al soporte técnico</p>
        </div>
      </div>
    </div>
  )
}

// Page Level Error Boundary
interface PageErrorBoundaryProps {
  children: ReactNode
  title?: string
}

export function PageErrorBoundary({ children, title }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Here you could log to an error reporting service
        console.error(`Page Error in ${title}:`, error, errorInfo)
      }}
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Error en {title || 'esta página'}
            </h2>
            <p className="text-gray-600 mb-6">
              No pudimos cargar el contenido. Por favor, intenta recargar la página.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Component Level Error Boundary
interface ComponentErrorBoundaryProps {
  children: ReactNode
  componentName?: string
  fallbackMessage?: string
}

export function ComponentErrorBoundary({ 
  children, 
  componentName,
  fallbackMessage 
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Component Error in ${componentName}:`, error, errorInfo)
      }}
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-800 font-medium">
            {fallbackMessage || `Error en ${componentName || 'este componente'}`}
          </p>
          <p className="text-red-600 text-sm mt-1">
            Por favor, recarga la página
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Error Alert Component (for non-critical errors)
interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  show: boolean
}

export function ErrorAlert({ 
  title = 'Error',
  message, 
  onRetry, 
  onDismiss, 
  show 
}: ErrorAlertProps) {
  if (!show) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="text-red-800 border-red-300 hover:bg-red-100"
                >
                  Reintentar
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-red-800 hover:bg-red-100"
                >
                  Cerrar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook para manejar errores async
export function useErrorHandler() {
  const [error, setError] = React.useState<string | null>(null)

  const handleError = React.useCallback((error: any, customMessage?: string) => {
    console.error('Error handled:', error)
    
    let message = customMessage || 'Ocurrió un error inesperado'
    
    if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }
    
    setError(message)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  }
}