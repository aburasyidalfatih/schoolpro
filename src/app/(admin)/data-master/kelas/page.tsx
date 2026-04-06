'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, LayoutGrid, Building2, Calendar } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import styles from './page.module.css'

export default function KelasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dependency Data
  const [units, setUnits] = useState<any[]>([])
  const [tahunAjarans, setTahunAjarans] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    unitId: '',
    tahunAjaranId: '',
    tingkat: '',
    kapasitas: 32,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/api/data-master/kelas?search=${encodeURIComponent(searchQuery)}` 
        : '/api/data-master/kelas'
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

  const fetchDependencies = async () => {
    try {
      const [resUnits, resTA] = await Promise.all([
        fetch('/api/data-master/unit'),
        fetch('/api/data-master/tahun-ajaran')
      ])
      const jsonUnits = await resUnits.json()
      const jsonTA = await resTA.json()
      
      if (jsonUnits.data) setUnits(jsonUnits.data)
      if (jsonTA.data) setTahunAjarans(jsonTA.data)
    } catch (e) {
      console.error('Error fetching dependencies', e)
    }
  }

  useEffect(() => {
    fetchDependencies()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ 
      nama: '', 
      unitId: units[0]?.id || '', 
      tahunAjaranId: tahunAjarans.find(ta => ta.isActive)?.id || tahunAjarans[0]?.id || '', 
      tingkat: '', 
      kapasitas: 32 
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        nama: row.nama,
        unitId: row.unitId,
        tahunAjaranId: row.tahunAjaranId,
        tingkat: row.tingkat || '',
        kapasitas: row.kapasitas,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    console.log('Delete requested for:', id, name)
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kelas "${name}"?`)) return

    try {
        const res = await fetch(`/api/data-master/kelas/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Kelas berhasil dihapus')
            fetchData()
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
      const url = isEditing ? `/api/data-master/kelas/${editId}` : '/api/data-master/kelas'
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
        fetchData()
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
      header: 'Info Kelas',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <LayoutGrid size={16} />
          </div>
          <div>
            <div className={styles.name}>{row.nama}</div>
            <div className={styles.username}>Tingkat {row.tingkat || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Unit / Jenjang',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={14} style={{ opacity: 0.5 }} />
          <span>{row.unit?.nama}</span>
        </div>
      )
    },
    {
      header: 'Tahun Ajaran',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ opacity: 0.5 }} />
          <span>{row.tahunAjaran?.nama}</span>
        </div>
      )
    },
    {
      header: 'Kapasitas',
      align: 'center',
      accessor: (row) => (
        <span className={styles.roleBadge}>
          {row.kapasitas} Siswa
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
          <h1 className={styles.title}>Data Kelas</h1>
          <p className={styles.subtitle}>Kelola daftar kelas dan rombongan belajar</p>
        </div>
        <button 
          className={styles.addBtn} 
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Tambah Kelas</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama kelas..."
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
        emptyMessage="Belum ada data kelas"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Data Kelas" : "Tambah Kelas Baru"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorText} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Kelas</label>
            <input 
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: Kelas 1A, X MIPA 1" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Unit / Jenjang</label>
              <select
                required
                name="unitId"
                value={formData.unitId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Pilih Unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.nama} ({u.kode})</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tahun Ajaran</label>
              <select
                required
                name="tahunAjaranId"
                value={formData.tahunAjaranId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Pilih Tahun</option>
                {tahunAjarans.map(ta => (
                  <option key={ta.id} value={ta.id}>{ta.nama} {ta.isActive ? '(Aktif)' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tingkat</label>
              <input 
                name="tingkat"
                value={formData.tingkat}
                onChange={handleInputChange}
                type="text" 
                className={styles.input} 
                placeholder="Contoh: 1, 10, atau VII" 
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Kapasitas (Siswa)</label>
              <input 
                required
                name="kapasitas"
                value={formData.kapasitas}
                onChange={handleInputChange}
                type="number" 
                className={styles.input} 
                placeholder="32" 
                disabled={isSubmitting}
              />
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
              {isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
