'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/ui'
import type { Column } from '@/components/ui'
import { toast } from 'sonner'
import shared from '@/styles/page.module.css'

type AuditLogRow = {
  id: string
  action: string
  summary: string
  targetType: string
  actorName: string | null
  actorRole: string | null
  createdAt: string
  tenant: {
    id: string
    nama: string
    slug: string
  } | null
}

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch('/api/super-admin/audit-logs')
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error || 'Gagal memuat audit log')
          return
        }
        setLogs(json.data || [])
      } catch {
        toast.error('Gagal memuat audit log')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [])

  const columns: Column<AuditLogRow>[] = [
    {
      header: 'Aktivitas',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.summary}</div>
          <div className={shared.cellSub}>{row.action}</div>
        </div>
      ),
    },
    {
      header: 'Tenant',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.tenant?.nama || 'Platform'}</div>
          <div className={shared.cellSub}>{row.tenant?.slug || row.targetType}</div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Aktor',
      accessor: (row) => (
        <div>
          <div className={shared.cellName}>{row.actorName || 'System'}</div>
          <div className={shared.cellSub}>{row.actorRole || '-'}</div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Waktu',
      accessor: (row) => new Date(row.createdAt).toLocaleString('id-ID'),
      width: '180px',
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div className={shared.headerLeft}>
          <h2 className={shared.title}>Audit Logs</h2>
          <p className={shared.subtitle}>Semua aksi sensitif super admin dicatat untuk pelacakan operasional.</p>
        </div>
      </div>

      <DataTable columns={columns} data={logs} isLoading={loading} emptyMessage="Belum ada audit log platform" />
    </div>
  )
}
