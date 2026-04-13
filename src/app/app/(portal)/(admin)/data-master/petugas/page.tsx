'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, User, Mail, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

type PetugasRow = {
  id: string
  nama: string
  email: string
  username: string
  role: string
  isActive: boolean
}

export default function PetugasPage() {
  const [data, setData] = useState<PetugasRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  // Confirm delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)

  const [formData, setFormData] = useState({
    nama: '', email: '', username: '', password: '', role: 'ADMIN', isActive: true,
  })

  const fetchPetugas = useCallback(async () => {
    setLoading(true)
    try {
      const url = searchQuery
        ? `/api/data-master/petugas?search=${encodeURIComponent(searchQuery)}`
        : '/api/data-master/petugas'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }, [searchQuery])

  useEffect(() => {
    const t = setTimeout(fetchPetugas, 300)
    return () => clearTimeout(t)
  }, [fetchPetugas])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ nama: '', email: '', username: '', password: '', role: 'ADMIN', isActive: true })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: PetugasRow) => {
    setEditId(row.id)
    setFormData({ nama: row.nama, email: row.email, username: row.username, password: '', role: row.role, isActive: row.isActive })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/petugas/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Petugas berhasil dihapus'); fetchPetugas() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      const isEditing = !!editId
      const payload: Partial<typeof formData> = { ...formData }
      if (isEditing && !payload.password) delete payload.password
      const res = await fetch(
        isEditing ? `/api/data-master/petugas/${editId}` : '/api/data-master/petugas',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchPetugas(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin', ADMIN: 'Administrator', KEUANGAN: 'Keuangan', TU: 'Tata Usaha', STAF: 'Staf',
  }

  const columns: Column<PetugasRow>[] = [
    {
      header: 'Petugas',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><User size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>@{row.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: 'var(--sp-text-sm)' }}>
          <Mail size={14} />{row.email}
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => {
        const roleColors: Record<string, string> = {
          SUPER_ADMIN: 'primary', ADMIN: 'primary', KEUANGAN: 'success', TU: 'warning', STAF: 'warning',
        }
        const color = roleColors[row.role] || 'gray'
        return (
          <span className={`badge badge-${color}`}>{ROLE_LABELS[row.role] || row.role}</span>
        )
      },
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`${shared.statusBadge} ${row.isActive ? shared.statusActive : shared.statusInactive}`}>
          {row.isActive ? 'Aktif' : 'Non-Aktif'}
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
          <h1 className={shared.title}>Data Petugas</h1>
          <p className={shared.subtitle}>Kelola akses administrator dan staf</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Petugas</Button>
      </div>

      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari nama, email, username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada data petugas" />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Data Petugas' : 'Tambah Petugas Baru'}>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Lengkap <span className="required">*</span></label>
            <input required name="nama" value={formData.nama} onChange={handleInputChange} className={shared.formInput} placeholder="Masukkan nama lengkap" disabled={isSubmitting} />
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Email <span className="required">*</span></label>
              <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className={shared.formInput} placeholder="email@sekolah.com" disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Username <span className="required">*</span></label>
              <input required name="username" value={formData.username} onChange={handleInputChange} className={shared.formInput} placeholder="username" disabled={isSubmitting} />
            </div>
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Role <span className="required">*</span></label>
              <select required name="role" value={formData.role} onChange={handleInputChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="ADMIN">Administrator</option>
                <option value="KEUANGAN">Keuangan</option>
                <option value="STAF">Staf Umum</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Kata Sandi {!editId && <span className="required">*</span>}</label>
              <input required={!editId} name="password" value={formData.password} onChange={handleInputChange} type="password" className={shared.formInput} placeholder={editId ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'} minLength={6} disabled={isSubmitting} />
            </div>
          </div>
          {editId && (
            <label className="toggle-switch">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
              <div className="toggle-slider" />
              <span className="toggle-label">Akun Aktif</span>
            </label>
          )}
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Petugas</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus petugas <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
