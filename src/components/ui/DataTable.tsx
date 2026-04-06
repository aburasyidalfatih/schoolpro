import React from 'react'
import styles from './DataTable.module.css'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({ columns, data, isLoading, emptyMessage = 'Data tidak ditemukan' }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                style={{
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyState}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
