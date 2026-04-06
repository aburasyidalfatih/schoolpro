'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, CreditCard, Settings, ShieldCheck, Globe, Building2, Save, Info } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import styles from './page.module.css'

type TabType = 'manual' | 'tripay'

export default function RekeningPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('manual')

  // Tripay Settings State
  const [tripayData, setTripayData] = useState({
    merchantCode: '',
    apiKey: '',
    privateKey: '',
    isSandbox: true,
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  // Form State (Manual Rekening)
  const [formData, setFormData] = useState({
    namaBank: '',
    noRekening: '',
    atasNama: '',
    isActive: true,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/data-master/rekening')
      const json = await res.json()
      if (json.data) setData(json.data)
      if (json.tripay) setTripayData(json.tripay)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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

  const handleTripayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setTripayData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ namaBank: '', noRekening: '', atasNama: '', isActive: true })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        namaBank: row.namaBank,
        noRekening: row.noRekening,
        atasNama: row.atasNama,
        isActive: row.isActive,
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus rekening "${name}"?`)) return

    try {
        const res = await fetch(`/api/data-master/rekening/${id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Rekening berhasil dihapus')
            fetchData()
        }
    } catch (error) {
        alert('Terjadi kesalahan server.')
    }
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const isEditing = !!editId
      const url = isEditing ? `/api/data-master/rekening/${editId}` : '/api/data-master/rekening'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else {
        setIsModalOpen(false)
        fetchData()
      }
    } catch (e) {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitTripay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/data-master/rekening/tripay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripayData),
      })
      const json = await res.json()
      if (res.ok) {
        alert(json.message)
        fetchData() // Refresh to see masked values
      } else {
        alert(json.error || 'Gagal menyimpan pengaturan')
      }
    } catch (e) {
      alert('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Info Rekening',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <Building2 size={18} />
          </div>
          <div>
            <div className={styles.name}>{row.namaBank}</div>
            <div className={styles.username}>{row.noRekening}</div>
          </div>
        </div>
      ),
    },
    {
        header: 'Atas Nama',
        accessor: (row) => <div style={{ fontWeight: 500 }}>{row.atasNama}</div>
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
          <button className={styles.actionBtn} onClick={() => openEditModal(row)} title="Edit">
            <Pencil size={14} />
          </button>
          <button className={styles.actionBtn} style={{ color: 'var(--danger-500)' }} onClick={() => handleDelete(row.id, row.namaBank)} title="Hapus">
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
          <h1 className={styles.title}>Pengaturan Pembayaran</h1>
          <p className={styles.subtitle}>Kelola rekening bank manual dan integrasi payment gateway</p>
        </div>
        {activeTab === 'manual' && (
          <button className={styles.addBtn} onClick={openAddModal}>
            <Plus size={18} />
            <span>Tambah Rekening</span>
          </button>
        )}
      </div>

      <div className={styles.tabsContainer} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
          <button 
              className={cn(styles.tabBtn, activeTab === 'manual' && styles.tabActive)} 
              onClick={() => setActiveTab('manual')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', border: 'none', background: 'none', color: activeTab === 'manual' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', borderBottom: activeTab === 'manual' ? '2px solid var(--primary-600)' : '2px solid transparent' }}
          >
              <CreditCard size={16} /> Manual (Transfer Bank)
          </button>
          <button 
              className={cn(styles.tabBtn, activeTab === 'tripay' && styles.tabActive)} 
              onClick={() => setActiveTab('tripay')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', border: 'none', background: 'none', color: activeTab === 'tripay' ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', borderBottom: activeTab === 'tripay' ? '2px solid var(--primary-600)' : '2px solid transparent' }}
          >
              <Globe size={16} /> Payment Gateway (Tripay)
          </button>
      </div>

      {activeTab === 'manual' ? (
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          emptyMessage="Belum ada rekening manual"
        />
      ) : (
        <div style={{ maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-800)', fontSize: '13px' }}>
                <Info size={20} />
                <p>Hubungkan akun Tripay Anda untuk menerima pembayaran otomatis via Virtual Account, QRIS, dan Retail Outlet.</p>
            </div>
            
            <form onSubmit={handleSubmitTripay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Merchant Code</label>
                    <input name="merchantCode" value={tripayData.merchantCode} onChange={handleTripayChange} className={styles.input} placeholder="T12345" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>API Key</label>
                    <input name="apiKey" value={tripayData.apiKey} onChange={handleTripayChange} className={styles.input} placeholder="DEV-XXX..." />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Private Key</label>
                    <input name="privateKey" value={tripayData.privateKey} onChange={handleTripayChange} className={styles.input} placeholder="XXX-XXX..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label className="toggle-switch">
                        <input type="checkbox" name="isSandbox" checked={tripayData.isSandbox} onChange={handleTripayChange} className="toggle-input" />
                        <div className="toggle-slider"></div>
                        <span className="toggle-label" style={{ fontWeight: 600 }}>Gunakan Mode SANDBOX</span>
                    </label>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <button type="submit" disabled={isSubmitting} className={styles.submitBtn} style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', marginLeft: 'auto' }}>
                        {isSubmitting ? <Loader2 size={18} className={styles.spinner} /> : <><Save size={18} /> Simpan Pengaturan</>}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Manual Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Rekening' : 'Tambah Rekening'}>
        <form className={styles.form} onSubmit={handleSubmitManual}>
          {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Bank / Dompet</label>
            <input required name="namaBank" value={formData.namaBank} onChange={handleInputChange} className={styles.input} placeholder="BCA / Mandiri / ShopeePay" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nomor Rekening</label>
            <input required name="noRekening" value={formData.noRekening} onChange={handleInputChange} className={styles.input} placeholder="0012345678" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Atas Nama</label>
            <input required name="atasNama" value={formData.atasNama} onChange={handleInputChange} className={styles.input} placeholder="Nama Pemilik Rekening" />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <label className="toggle-switch">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
                <div className="toggle-slider"></div>
                <span className="toggle-label">Rekening Aktif</span>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className={styles.actionBtn} style={{ background: 'var(--bg-hover)', color: 'var(--text-color)', width: 'auto', padding: '0.625rem 1rem' }} onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>{isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Rekening'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
