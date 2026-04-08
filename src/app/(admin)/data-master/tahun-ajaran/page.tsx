'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatDate } from '@/lib/utils'
import shared from '@/styles/page.module.css'

export default function TahunAjaranPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [formData, setFormData] = useState({ nama: '', tanggalMulai: '', tanggalSelesai: '', isActive: false })

  const fetchTA = async () => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/data-master/tahun-ajaran?search=${encodeURIComponent(searchQuery)}` : '/api/data-master/tahun-ajaran'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchTA, 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const openAddModal = () => {
    setEditId(null); setFormData({ nama: '', tanggalMulai: '', tanggalSelesai: '', isActive: false }); setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({ nama: row.nama, tanggalMulai: row.tanggalMulai.split('T')[0], tanggalSelesai: row.tanggalSelesai.split('T')[0], isActive: row.isActive })
    setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/tahun-ajaran/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Tahun ajaran berhasil dihapus'); fetchTA() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/data-master/tahun-ajaran/${editId}` : '/api/data-master/tahun-ajaran',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchTA(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    {
      header: 'Tahun Ajaran',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><Calendar size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>{formatDate(row.tanggalMulai)} — {formatDate(row.tanggalSelesai)}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`${shared.statusBadge} ${row.isActive ? shared.statusActive : shared.statusNeutral}`}>
          {row.isActive ? 'Sedang Aktif' : 'Non-Aktif'}
        </span>
      ),
    },
    {
      header: 'Aksi', align: 'center', width: '120px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={shared.actionBtn} onClick={() => openEditModal(row)} title="Edit"><Pencil size={14} /></button>
          <button className={`${shared.actionBtn} ${shared.actionBtnDanger}`} onClick={() => setDeleteTarget({ id: row.id, nama: row.nama })} title="Hapus"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Data Tahun Ajaran</h1>
          <p className={shared.subtitle}>Atur periode tahun ajaran aktif sistem</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Tahun</Button>
      </div>
      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari tahun ajaran..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada data tahun ajaran" />

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Tahun Ajaran <span className="required">*</span></label>
            <input required name="nama" value={formData.nama} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: 2024/2025" disabled={isSubmitting} />
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tanggal Mulai <span className="required">*</span></label>
              <input required name="tanggalMulai" value={formData.tanggalMulai} onChange={handleInputChange} type="date" className={shared.formInput} disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tanggal Selesai <span className="required">*</span></label>
              <input required name="tanggalSelesai" value={formData.tanggalSelesai} onChange={handleInputChange} type="date" className={shared.formInput} disabled={isSubmitting} />
            </div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
            <div className="toggle-slider" />
            <span className="toggle-label">Jadikan Tahun Aktif</span>
          </label>
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Tahun</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus tahun ajaran <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>? Semua kelas dan tagihan terkait akan terpengaruh.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
