'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) 0',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}
    >
      {totalItems !== undefined && pageSize !== undefined ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Menampilkan {Math.min((page - 1) * pageSize + 1, totalItems)}–
          {Math.min(page * pageSize, totalItems)} dari {totalItems} data
        </span>
      ) : (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Halaman {page} dari {totalPages}
        </span>
      )}

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Sebelumnya">
          <ChevronLeft size={14} />
        </PageBtn>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === page}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Berikutnya">
          <ChevronRight size={14} />
        </PageBtn>
      </div>
    </div>
  )
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label'?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px',
        padding: '0 0.375rem',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 700 : 500,
        color: active ? 'white' : 'var(--text-secondary)',
        background: active
          ? 'linear-gradient(135deg, var(--primary-600), var(--primary-700))'
          : 'var(--bg-secondary)',
        border: `1px solid ${active ? 'transparent' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all var(--transition-fast)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {children}
    </button>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}
