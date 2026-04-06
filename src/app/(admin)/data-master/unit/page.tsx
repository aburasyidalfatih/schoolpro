'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, Building2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import styles from './page.module.css'

export default function UnitPage() {
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
    kode: '',
    isActive: true,
  })

  const fetchUnits = async () => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/api/data-master/unit?search=${encodeURIComponent(searchQuery)}` 
        : '/api/data-master/unit'
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
      fetchUnits()
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
    setFormData({ nama: '', kode: '', isActive: true })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        nama: row.nama,
        kode: row.kode,
        isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    console.log('Delete requested for:', id, name)
    if (!window.confirm(`Apakah Anda yakin ingin menghapus unit "${name}"?`)) {
        console.log('Delete cancelled by user')
        return
    }

    try {
        console.log('Executing DELETE request...')
        const res = await fetch(`/api/data-master/unit/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Unit berhasil dihapus')
            fetchUnits()
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
      const url = isEditing ? `/api/data-master/unit/${editId}` : '/api/data-master/unit'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Terjadi kesalahan')
      } else {
        // Success
        setIsModalOpen(false)
        fetchUnits() // Refresh table
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
      header: 'Nama Unit Info',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <Building2 size={16} />
          </div>
          <div>
            <div className={styles.name}>{row.nama}</div>
            <div className={styles.username}>Kode: {row.kode}</div>
          </div>
        </div>
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
      width: '180px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button 
            className={styles.actionBtn} 
            title="Edit Unit"
            onClick={() => openEditModal(row)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-hover)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
          >
            <Pencil size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Edit</span>
          </button>
          <button 
            className={styles.actionBtn} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger-500)', backgroundColor: 'var(--danger-50)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
            title="Hapus Unit"
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
          <h1 className={styles.title}>Data Unit / Jenjang</h1>
          <p className={styles.subtitle}>Kelola unit sekolah (SD, SMP, SMA, dll)</p>
        </div>
        <button 
          className={styles.addBtn} 
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Tambah Unit</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari unit atau kode..."
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
        emptyMessage="Belum ada data unit/jenjang"
      />

      {/* Modal Tambah/Edit Unit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Data Unit" : "Tambah Unit Baru"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorText} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Unit</label>
              <input 
                required
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                type="text" 
                className={styles.input} 
                placeholder="Contoh: SD IT Al-Hanifah" 
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kode Unit</label>
              <input 
                required
                name="kode"
                value={formData.kode}
                onChange={handleInputChange}
                type="text" 
                className={styles.input} 
                placeholder="Contoh: SD" 
                disabled={isSubmitting}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className={styles.formRow}>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                  <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="toggle-input"
                    />
                    <div className="toggle-slider"></div>
                    <span className="toggle-label">Unit Aktif</span>
                  </label>
              </div>
          </div>

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
              {isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
