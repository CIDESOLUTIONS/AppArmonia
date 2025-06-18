'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// Form Root Component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
}

// Form Field Group
interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <label 
      className={cn(
        'text-sm font-medium text-gray-700',
        className
      )} 
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

// Form Error Message
interface FormErrorProps {
  children?: React.ReactNode
  className?: string
}

export function FormError({ children, className }: FormErrorProps) {
  if (!children) return null
  
  return (
    <p className={cn('text-sm text-red-600', className)}>
      {children}
    </p>
  )
}

// Form Description
interface FormDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-600', className)}>
      {children}
    </p>
  )
}

// Form Grid Layout
interface FormGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}

export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      {
        'grid-cols-1': cols === 1,
        'grid-cols-1 md:grid-cols-2': cols === 2,
        'grid-cols-1 md:grid-cols-3': cols === 3,
        'grid-cols-1 md:grid-cols-4': cols === 4,
      },
      className
    )}>
      {children}
    </div>
  )
}

// Form Section with Title
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Form Actions (Buttons container)
interface FormActionsProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  return (
    <div className={cn(
      'flex gap-3 pt-6 border-t border-gray-200',
      {
        'justify-start': align === 'left',
        'justify-center': align === 'center',
        'justify-end': align === 'right',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-md text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'disabled:bg-gray-50 disabled:text-gray-500',
        'resize-none',
        {
          'border-red-300 focus:ring-red-500': error,
        },
        className
      )}
      {...props}
    />
  )
}

// File Input Component
interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  accept?: string
  multiple?: boolean
  error?: boolean
}

export function FileInput({ className, error, ...props }: FileInputProps) {
  return (
    <input
      type="file"
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-md text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        'file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0',
        'file:text-sm file:font-medium file:bg-primary file:text-white',
        'hover:file:bg-primary/90',
        {
          'border-red-300 focus:ring-red-500': error,
        },
        className
      )}
      {...props}
    />
  )
}

// Checkbox with Label
interface CheckboxFieldProps {
  id: string
  label: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  error?: string
  className?: string
}

export function CheckboxField({ 
  id, 
  label, 
  description, 
  checked, 
  onChange, 
  error,
  className 
}: CheckboxFieldProps) {
  return (
    <FormField className={className}>
      <div className="flex items-start space-x-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={cn(
            'mt-1 h-4 w-4 text-primary border-gray-300 rounded',
            'focus:ring-2 focus:ring-primary focus:ring-offset-0',
            {
              'border-red-300': error,
            }
          )}
        />
        <div className="flex-1">
          <FormLabel htmlFor={id} className="cursor-pointer">
            {label}
          </FormLabel>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          {error && <FormError>{error}</FormError>}
        </div>
      </div>
    </FormField>
  )
}

// Radio Group
interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  error,
  className 
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'mt-1 h-4 w-4 text-primary border-gray-300',
              'focus:ring-2 focus:ring-primary focus:ring-offset-0',
              {
                'border-red-300': error,
              }
            )}
          />
          <div className="flex-1">
            <FormLabel htmlFor={`${name}-${option.value}`} className="cursor-pointer">
              {option.label}
            </FormLabel>
            {option.description && (
              <FormDescription>{option.description}</FormDescription>
            )}
          </div>
        </div>
      ))}
      {error && <FormError>{error}</FormError>}
    </div>
  )
}