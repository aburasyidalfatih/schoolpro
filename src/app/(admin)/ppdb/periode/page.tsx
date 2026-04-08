'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, Calendar, Layout, Building2, Users } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/lib/utils'
import styles from './page.module.css'

export default function PeriodePpdbPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dependencies
  const [tahunAjarans, setTahunAjarans] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    tahunAjaranId: '',
    unitId: '',
    tanggalBuka: '',
    tanggalTutup: '',
    biayaPendaftaran: '',
    isActive: true,
  })

  const fetchPeriode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ppdb/periode')
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
      const [resTA, resUnit] = await Promise.all([
        fetch('/api/data-master/tahun-ajaran'),
        fetch('/api/data-master/unit')
      ])
      const jsonTA = await resTA.json()
      const jsonUnit = await resUnit.json()
      if (jsonTA.data) setTahunAjarans(jsonTA.data)
      if (jsonUnit.data) setUnits(jsonUnit.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPeriode()
    fetchDependencies()
  }, [])

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
      tahunAjaranId: tahunAjarans.find(t => t.isActive)?.id || '',
      unitId: '',
      tanggalBuka: '',
      tanggalTutup: '',
      biayaPendaftaran: '',
      isActive: true,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
      nama: row.nama,
      tahunAjaranId: row.tahunAjaranId,
      unitId: row.unitId || '',
      tanggalBuka: row.tanggalBuka.split('T')[0],
      tanggalTutup: row.tanggalTutup.split('T')[0],
      biayaPendaftaran: row.pengaturan?.biayaPendaftaran || '',
      isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus gelombang "${name}"?`)) return

    try {
      const res = await fetch(`/api/ppdb/periode/${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Gagal menghapus data')
      } else {
        fetchPeriode()
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
      const url = isEditing ? `/api/ppdb/periode/${editId}` : '/api/ppdb/periode'
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
        fetchPeriode()
      }
    } catch (e) {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val)
  }

  const columns: Column<any>[] = [
    {
      header: 'Gelombang / Periode',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '8px', 
            background: 'var(--primary-100)', color: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Layout size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>{row.nama}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.tahunAjaran?.nama} {row.unit ? `• ${row.unit.nama}` : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Masa Pendaftaran',
      accessor: (row) => (
        <div style={{ fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-color)' }}>
            <Calendar size={14} className="text-muted" />
            <span>{formatDate(row.tanggalBuka)} - {formatDate(row.tanggalTutup)}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Biaya Form',
      accessor: (row) => (
        <div style={{ fontWeight: 500 }}>
          {formatCurrency(row.pengaturan?.biayaPendaftaran || 0)}
        </div>
      ),
    },
    {
        header: 'Pendaftar',
        accessor: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Users size={14} className="text-muted" />
            <span style={{ fontWeight: 600 }}>{row._count?.pendaftars || 0}</span>
          </div>
        ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={styles.statusBadge} data-active={row.isActive}>
          {row.isActive ? 'Aktif / Buka' : 'Ditutup'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      align: 'center',
      width: '120px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={styles.actionBtn} title="Edit" onClick={() => openEditModal(row)}>
            <Pencil size={16} />
          </button>
          <button 
            className={styles.actionBtn} 
            title="Hapus" 
            style={{ color: 'var(--danger-500)' }}
            onClick={() => handleDelete(row.id, row.nama)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gelombang PPDB</h1>
          <p className={styles.subtitle}>Kelola periode pendaftaran siswa baru</p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>Tambah Gelombang</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari gelombang..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={loading}
        emptyMessage="Belum ada gelombang pendaftaran."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Gelombang PPDB" : "Buka Gelombang Baru"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div style={{ color: 'var(--danger-500)', fontSize: '0.875rem' }}>{errorMsg}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Gelombang</label>
            <input 
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: Gelombang 1 (Reguler)" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formRow}>
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
                {tahunAjarans.map(t => (
                  <option key={t.id} value={t.id}>{t.nama} {t.isActive ? '(Aktif)' : ''}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Unit / Jenjang (Opsional)</label>
              <select 
                name="unitId"
                value={formData.unitId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Semua Unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tanggal Buka</label>
              <input 
                required
                name="tanggalBuka"
                value={formData.tanggalBuka}
                onChange={handleInputChange}
                type="date" 
                className={styles.input} 
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tanggal Tutup</label>
              <input 
                required
                name="tanggalTutup"
                value={formData.tanggalTutup}
                onChange={handleInputChange}
                type="date" 
                className={styles.input} 
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Biaya Pendaftaran (Formulir)</label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', fontWeight: 600 }}>Rp</span>
                <input 
                    required
                    name="biayaPendaftaran"
                    value={formData.biayaPendaftaran}
                    onChange={handleInputChange}
                    type="number" 
                    className={styles.input} 
                    style={{ paddingLeft: '36px' }}
                    placeholder="Contoh: 150000" 
                    disabled={isSubmitting}
                />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleInputChange} 
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className={styles.label}>Aktifkan pendaftaran sekarang</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className={styles.actionBtn} 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className={styles.spinner} size={18} /> : (editId ? 'Simpan Perubahan' : 'Buka Gelombang')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
