'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  )
}

// Loading Button
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({ 
  loading = false, 
  loadingText, 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2',
        'bg-primary text-white rounded-md text-sm font-medium',
        'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {loading ? (loadingText || 'Cargando...') : children}
    </button>
  )
}

// Full Page Loading
interface FullPageLoadingProps {
  message?: string
  description?: string
}

export function FullPageLoading({ 
  message = 'Cargando...', 
  description 
}: FullPageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">{message}</h2>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
    </div>
  )
}

// Content Loading (for sections)
interface ContentLoadingProps {
  message?: string
  height?: string
  className?: string
}

export function ContentLoading({ 
  message = 'Cargando contenido...', 
  height = 'h-64',
  className 
}: ContentLoadingProps) {
  return (
    <div className={cn(
      'flex items-center justify-center bg-white rounded-lg border',
      height,
      className
    )}>
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Table Loading Skeleton
interface TableLoadingProps {
  rows?: number
  columns?: number
}

export function TableLoading({ rows = 5, columns = 4 }: TableLoadingProps) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className="h-4 bg-gray-100 rounded animate-pulse" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Card Loading Skeleton
interface CardLoadingProps {
  count?: number
  className?: string
}

export function CardLoading({ count = 3, className }: CardLoadingProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-8 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Generic Skeleton
interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ 
  width = 'w-full', 
  height = 'h-4', 
  className 
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        'bg-gray-200 rounded animate-pulse',
        width,
        height,
        className
      )} 
    />
  )
}

// Progress Bar
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  className 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Loading Overlay
interface LoadingOverlayProps {
  show: boolean
  message?: string
  children: React.ReactNode
}

export function LoadingOverlay({ 
  show, 
  message = 'Procesando...', 
  children 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {show && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-3" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}