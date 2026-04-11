'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, FileText, CheckCircle2, HelpCircle } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import styles from './page.module.css'

export default function PersyaratanPpdbPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [periodes, setPeriodes] = useState<any[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    isWajib: true,
    tipeFile: 'image/jpeg,image/png,application/pdf',
  })

  const fetchPeriodes = async () => {
    try {
      const res = await fetch('/api/ppdb/periode')
      const json = await res.json()
      if (json.data) {
        setPeriodes(json.data)
        if (json.data.length > 0) {
          const active = json.data.find((p: any) => p.isActive)
          setSelectedPeriode(active ? active.id : json.data[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchPersyaratan = async (periodeId: string) => {
    if (!periodeId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/ppdb/persyaratan?periodeId=${periodeId}`)
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
    fetchPeriodes()
  }, [])

  useEffect(() => {
    if (selectedPeriode) {
      fetchPersyaratan(selectedPeriode)
    }
  }, [selectedPeriode])

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
    setFormData({
      nama: '',
      isWajib: true,
      tipeFile: 'image/jpeg,image/png,application/pdf',
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus persyaratan "${name}"?`)) return

    try {
      const res = await fetch(`/api/ppdb/persyaratan/${id}`, { method: 'DELETE' })
      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Gagal menghapus data')
      } else {
        fetchPersyaratan(selectedPeriode)
      }
    } catch {
      alert('Terjadi kesalahan server.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/ppdb/persyaratan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, periodeId: selectedPeriode }),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Terjadi kesalahan')
      } else {
        setIsModalOpen(false)
        fetchPersyaratan(selectedPeriode)
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Nama Persyaratan Berkas',
      accessor: (row) => (
        <div className={styles.requirementCard}>
          <div className={styles.iconBox}>
            <FileText size={20} />
          </div>
          <div>
            <div className={styles.reqName}>{row.nama}</div>
            <div className={styles.reqMeta}>Tipe: {row.tipeFile.split(',').join(', ')}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Sifat Berkas',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.isWajib ? (
            <span className={styles.badge} data-type="wajib">
              <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
              Wajib Tinggi
            </span>
          ) : (
            <span className={styles.badge} data-type="opsional">
              <HelpCircle size={12} style={{ marginRight: '4px' }} />
              Opsional
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Aksi',
      align: 'center',
      width: '100px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button 
            className={`${styles.actionBtn} ${styles.danger}`} 
            title="Hapus" 
            onClick={() => handleDelete(row.id, row.nama)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Persyaratan Berkas</h1>
          <p className={styles.subtitle}>Atur dokumen wajib yang harus diunggah pendaftar</p>
        </div>
        <button 
            className={styles.addBtn} 
            onClick={openAddModal}
            disabled={!selectedPeriode}
        >
          <Plus size={18} />
          <span>Tambah Syarat</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Pilih Gelombang PPDB</label>
          <select 
            className={styles.select} 
            value={selectedPeriode} 
            onChange={(e) => setSelectedPeriode(e.target.value)}
          >
            <option value="">-- Pilih Gelombang --</option>
            {periodes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nama} ({p.tahunAjaran?.nama}) {p.isActive ? '• Sedang Buka' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage={selectedPeriode ? "Belum ada persyaratan berkas untuk gelombang ini." : "Silakan pilih gelombang terlebih dahulu."}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Tambah Syarat Berkas"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div style={{ color: 'var(--danger-500)', fontSize: '0.875rem' }}>{errorMsg}</div>}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Persyaratan</label>
            <input 
              required
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: Ijazah Terakhir / Kartu Keluarga" 
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tipe File yang Diizinkan</label>
            <input 
              required
              name="tipeFile"
              value={formData.tipeFile}
              onChange={handleInputChange}
              type="text" 
              className={styles.input} 
              placeholder="Contoh: image/jpeg,image/png,application/pdf" 
              disabled={isSubmitting}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Pisahkan dengan koma. Default: Gambar dan PDF.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="isWajib" 
                name="isWajib" 
                checked={formData.isWajib} 
                onChange={handleInputChange} 
                disabled={isSubmitting}
              />
              <label htmlFor="isWajib" className={styles.label}>Wajib Diunggah (Mandatory)</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}
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
              {isSubmitting ? <Loader2 className={styles.spinner} size={18} /> : 'Simpan Persyaratan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
