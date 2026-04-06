'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, User, Mail, Loader2, Pencil, Trash2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import styles from './page.module.css'

export default function PetugasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    username: '',
    password: '',
    role: 'ADMIN',
    isActive: true,
  })

  const fetchPetugas = async () => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/api/data-master/petugas?search=${encodeURIComponent(searchQuery)}` 
        : '/api/data-master/petugas'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) {
        setData(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPetugas()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked
        setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ nama: '', email: '', username: '', password: '', role: 'ADMIN', isActive: true })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        nama: row.nama,
        email: row.email,
        username: row.username,
        password: '', // blank password unless changing
        role: row.role,
        isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    console.log('Delete requested for:', id, name)
    if (!window.confirm(`Apakah Anda yakin ingin menghapus petugas "${name}"?`)) {
        console.log('Delete cancelled by user')
        return
    }

    try {
        console.log('Executing DELETE request...')
        const res = await fetch(`/api/data-master/petugas/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Petugas berhasil dihapus')
            fetchPetugas()
        }
    } catch (error) {
        console.error('Delete error:', error)
        alert('Terjadi kesalahan server.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const isEditing = !!editId
      const url = isEditing ? `/api/data-master/petugas/${editId}` : '/api/data-master/petugas'
      const method = isEditing ? 'PUT' : 'POST'

      // if editing and password is empty, don't send password
      const payload: Partial<typeof formData> = { ...formData }
      if (isEditing && !payload.password) {
        delete payload.password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Terjadi kesalahan')
      } else {
        // Success
        setIsModalOpen(false)
        fetchPetugas() // Refresh table
        alert(json.message)
      }
    } catch (e) {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Petugas',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <div>
            <div className={styles.name}>{row.nama}</div>
            <div className={styles.username}>@{row.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (row) => (
        <div className={styles.emailCell}>
          <Mail size={14} />
          {row.email}
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => (
        <span className={styles.roleBadge} data-role={row.role}>
          {row.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={styles.statusBadge} data-active={row.isActive}>
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
          <button 
            className={styles.actionBtn} 
            title="Edit Petugas"
            onClick={() => openEditModal(row)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-hover)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
          >
            <Pencil size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Edit</span>
          </button>
          <button 
            className={styles.actionBtn} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger-500)', backgroundColor: 'var(--danger-50)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
            title="Hapus Petugas"
            onClick={() => handleDelete(row.id, row.nama)}
          >
            <Trash2 size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Hapus</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Data Petugas</h1>
          <p className={styles.subtitle}>Kelola akses administrator dan staf</p>
        </div>
        <button 
          className={styles.addBtn} 
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Tambah Petugas</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama, email, username..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {/* We can add filter dropdowns here later */}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada data petugas"
      />

      {/* Modal Tambah/Edit Petugas */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Data Petugas" : "Tambah Petugas Baru"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorText} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Lengkap</label>
            <input 
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Masukkan nama lengkap" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input 
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email" 
                className={styles.input} 
                placeholder="email@sekolah.com" 
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Username</label>
              <input 
                required
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                type="text" 
                className={styles.input} 
                placeholder="username" 
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tingkat Akses (Role)</label>
              <select 
                required
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="ADMIN">Administrator</option>
                <option value="KEUANGAN">Keuangan</option>
                <option value="STAF">Staf Umum</option>
                <option value="TU">Tata Usaha</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kata Sandi</label>
              <input 
                required={!editId}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type="password" 
                className={styles.input} 
                placeholder={editId ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                minLength={6} 
                disabled={isSubmitting}
              />
            </div>
          </div>

          {editId && (
              <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                          type="checkbox" 
                          name="isActive" 
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          id="isActive"
                          style={{ width: '1rem', height: '1rem' }}
                      />
                      <label htmlFor="isActive" className={styles.label} style={{ cursor: 'pointer' }}>Akun Aktif</label>
                  </div>
              </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className={styles.actionBtn} 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              style={{ background: 'var(--bg-hover)', color: 'var(--text-color)', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Petugas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
