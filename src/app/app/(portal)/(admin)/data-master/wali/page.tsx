'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

type WaliRow = {
  id: string
  nama: string
  email: string
  username: string
  role: string
  isActive: boolean
}

export default function WaliPage() {
  const [data, setData] = useState<WaliRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: '',
    password: '',
    isActive: true,
  })

  const fetchWali = useCallback(async () => {
    setLoading(true)
    try {
      const url = searchQuery
        ? `/api/data-master/wali?search=${encodeURIComponent(searchQuery)}`
        : '/api/data-master/wali'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch {
      toast.error('Gagal memuat data akun wali')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(fetchWali, 300)
    return () => clearTimeout(timer)
  }, [fetchWali])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ nama: '', email: '', username: '', password: '', isActive: true })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: WaliRow) => {
    setEditId(row.id)
    setFormData({
      nama: row.nama,
      email: row.email,
      username: row.username,
      password: '',
      isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      const res = await fetch(`/api/data-master/wali/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Gagal menghapus akun wali')
        return
      }

      toast.success('Akun wali berhasil dihapus')
      fetchWali()
    } catch {
      toast.error('Terjadi kesalahan server')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const isEditing = Boolean(editId)
      const payload: Partial<typeof formData> = { ...formData }
      if (isEditing && !payload.password) delete payload.password

      const res = await fetch(
        isEditing ? `/api/data-master/wali/${editId}` : '/api/data-master/wali',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Terjadi kesalahan')
        return
      }

      setIsModalOpen(false)
      fetchWali()
      toast.success(json.message)
    } catch {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<WaliRow>[] = [
    {
      header: 'Wali/Orangtua',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}>
            <Users size={16} />
          </div>
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: 'var(--sp-text-sm)',
          }}
        >
          <Mail size={14} />
          {row.email}
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: () => <span className="badge badge-primary">Wali</span>,
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
      header: 'Aksi',
      align: 'center',
      width: '120px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={shared.actionBtn} onClick={() => openEditModal(row)} title="Edit">
            <Pencil size={14} />
          </button>
          <button
            className={`${shared.actionBtn} ${shared.actionBtnDanger}`}
            onClick={() => setDeleteTarget({ id: row.id, nama: row.nama })}
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Data Wali/Orangtua</h1>
          <p className={shared.subtitle}>Kelola akun akses orangtua atau wali siswa secara terpisah dari petugas</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>
          Tambah Wali
        </Button>
      </div>

      <div className={shared.toolbar}>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, email, atau username..."
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada data wali/orangtua"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? 'Edit Data Wali/Orangtua' : 'Tambah Akun Wali/Orangtua'}
      >
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>
              Nama Lengkap <span className="required">*</span>
            </label>
            <input
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className={shared.formInput}
              placeholder="Masukkan nama lengkap"
              disabled={isSubmitting}
            />
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Email <span className="required">*</span>
              </label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                className={shared.formInput}
                placeholder="email@orangtua.com"
                disabled={isSubmitting}
              />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Username <span className="required">*</span>
              </label>
              <input
                required
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={shared.formInput}
                placeholder="username"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Peran Akses
              </label>
              <input value="Wali/Orangtua" className={shared.formInput} disabled />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>
                Kata Sandi {!editId && <span className="required">*</span>}
              </label>
              <input
                required={!editId}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type="password"
                className={shared.formInput}
                placeholder={editId ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {editId && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="toggle-input"
              />
              <div className="toggle-slider" />
              <span className="toggle-label">Akun Aktif</span>
            </label>
          )}
          <div className={shared.modalFooter}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan Akun Wali
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus akun wali/orangtua{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Ya, Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}
