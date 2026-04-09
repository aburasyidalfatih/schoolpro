import React from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate class names based on globals.css tokens
    const baseClass = 'btn'
    const variantClass = variant !== 'primary' ? `btn-${variant}` : 'btn-primary'
    const sizeClass = size !== 'md' ? `btn-${size}` : ''
    
    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
        {!isLoading && leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-1">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'
