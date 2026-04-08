import React from 'react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon = <Inbox size={40} />,
  title = 'Tidak ada data',
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
      }}
    >
      <div style={{ marginBottom: '1rem', opacity: 0.4 }}>{icon}</div>
      <p
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: description ? '0.5rem' : 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ fontSize: 'var(--text-sm)', maxWidth: '360px' }}>{description}</p>
      )}
      {action && <div style={{ marginTop: '1.5rem' }}>{action}</div>}
    </div>
  )
}
