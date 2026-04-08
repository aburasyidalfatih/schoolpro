'use client'

import React from 'react'
import { Search } from 'lucide-react'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerStyle?: React.CSSProperties
}

export function SearchInput({ className = '', containerStyle, ...props }: SearchInputProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '320px',
        maxWidth: '100%',
        ...containerStyle,
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.875rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className={`form-input ${className}`}
        style={{ paddingLeft: '2.5rem' }}
        {...props}
      />
    </div>
  )
}
