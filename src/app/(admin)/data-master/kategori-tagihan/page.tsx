'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, CreditCard, History, CircleCheck, CircleX } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import styles from './page.module.css'

export default function KategoriTagihanPage() {
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
    isBulanan: false,
    isActive: true,
  })

  const fetchKategori = async () => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/api/data-master/kategori-tagihan?search=${encodeURIComponent(searchQuery)}` 
        : '/api/data-master/kategori-tagihan'
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
      fetchKategori()
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
    setFormData({ 
        nama: '', 
        kode: '', 
        isBulanan: false, 
        isActive: true 
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        nama: row.nama,
        kode: row.kode,
        isBulanan: row.isBulanan,
        isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return

    try {
        const res = await fetch(`/api/data-master/kategori-tagihan/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Kategori berhasil dihapus')
            fetchKategori()
        }
    } catch (error) {
        alert('Terjadi kesalahan server.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const isEditing = !!editId
      const url = isEditing ? `/api/data-master/kategori-tagihan/${editId}` : '/api/data-master/kategori-tagihan'
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
        setIsModalOpen(false)
        fetchKategori()
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
      header: 'Kategori Tagihan',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <CreditCard size={18} />
          </div>
          <div>
            <div className={styles.name}>{row.nama}</div>
            <div className={styles.username}>ID: {row.kode}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipe Tagihan',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {row.isBulanan ? (
            <span className={styles.roleBadge} style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
              <History size={12} style={{ marginRight: '4px' }} />
              Tagihan Bulanan
            </span>
          ) : (
            <span className={styles.roleBadge} style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              Sekali Bayar
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status Kontrol',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {row.isActive ? (
             <><CircleCheck size={14} style={{ color: 'var(--success-500)' }} /> <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>Aktif</span></>
          ) : (
             <><CircleX size={14} style={{ color: 'var(--danger-500)' }} /> <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>Non-Aktif</span></>
          )}
        </div>
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
            title="Edit"
            onClick={() => openEditModal(row)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--bg-hover)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
          >
            <Pencil size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Edit</span>
          </button>
          <button 
            className={styles.actionBtn} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger-500)', backgroundColor: 'var(--danger-50)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)' }}
            title="Hapus"
            onClick={() => handleDelete(row.id, row.nama)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Kategori Tagihan</h1>
          <p className={styles.subtitle}>Atur jenis-jenis komponen biaya pendidikan siswa</p>
        </div>
        <button 
          className={styles.addBtn} 
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Kategori Baru</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari kategori atau kode..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada kategori tagihan"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Kategori Tagihan" : "Tambah Kategori Tagihan"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorText} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Kategori</label>
            <input 
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: SPP Bulanan, Uang Buku" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Kode Kategori</label>
            <input 
              required
              name="kode"
              value={formData.kode}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: SPP, BK1" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formRow} style={{ marginTop: '0.5rem' }}>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        name="isBulanan" 
                        checked={formData.isBulanan}
                        onChange={handleInputChange}
                        className="toggle-input"
                    />
                    <div className="toggle-slider"></div>
                    <span className="toggle-label">Tagihan Bulanan</span>
                  </label>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="toggle-input"
                    />
                    <div className="toggle-slider"></div>
                    <span className="toggle-label">Aktif</span>
                  </label>
              </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
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
              {isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
