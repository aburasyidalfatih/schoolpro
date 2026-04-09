'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Globe, Building2, Save, Info } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import shared from '@/styles/page.module.css'

type TabType = 'manual' | 'tripay'

export default function RekeningPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('manual')
  const [tripayData, setTripayData] = useState({ merchantCode: '', apiKey: '', privateKey: '', isSandbox: true })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [formData, setFormData] = useState({ namaBank: '', noRekening: '', atasNama: '', isActive: true })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/data-master/rekening')
      const json = await res.json()
      if (json.data) setData(json.data)
      if (json.tripay) setTripayData(json.tripay)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const handleTripayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setTripayData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openAddModal = () => {
    setEditId(null); setFormData({ namaBank: '', noRekening: '', atasNama: '', isActive: true }); setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id); setFormData({ namaBank: row.namaBank, noRekening: row.noRekening, atasNama: row.atasNama, isActive: row.isActive }); setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/rekening/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Rekening berhasil dihapus'); fetchData() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/data-master/rekening/${editId}` : '/api/data-master/rekening',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchData(); toast.success(json.message || 'Rekening disimpan') }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const handleSubmitTripay = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const res = await fetch('/api/data-master/rekening/tripay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tripayData),
      })
      const json = await res.json()
      if (res.ok) { toast.success(json.message); fetchData() }
      else toast.error(json.error || 'Gagal menyimpan pengaturan')
    } catch { toast.error('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    {
      header: 'Info Rekening',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><Building2 size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.namaBank}</div>
            <div className={shared.cellSub}>{row.noRekening}</div>
          </div>
        </div>
      ),
    },
    { header: 'Atas Nama', accessor: (row) => <span style={{ fontWeight: 500 }}>{row.atasNama}</span> },
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
          <button className={`${shared.actionBtn} ${shared.actionBtnDanger}`} onClick={() => setDeleteTarget({ id: row.id, nama: row.namaBank })} title="Hapus"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Pengaturan Pembayaran</h1>
          <p className={shared.subtitle}>Kelola rekening bank manual dan integrasi payment gateway</p>
        </div>
        {activeTab === 'manual' && <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Rekening</Button>}
      </div>

      {/* Tabs */}
      <div className={shared.modalTabs} style={{ marginBottom: 'var(--space-6)' }}>
        <button className={cn(shared.tabBtn, activeTab === 'manual' && shared.tabActive)} onClick={() => setActiveTab('manual')}>
          <CreditCard size={15} /> Manual (Transfer Bank)
        </button>
        <button className={cn(shared.tabBtn, activeTab === 'tripay' && shared.tabActive)} onClick={() => setActiveTab('tripay')}>
          <Globe size={15} /> Payment Gateway (Tripay)
        </button>
      </div>

      {activeTab === 'manual' ? (
        <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada rekening manual" />
      ) : (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: 'var(--space-6)', padding: '1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)', color: 'var(--primary-700)', fontSize: 'var(--text-sm)' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <p>Hubungkan akun Tripay untuk menerima pembayaran otomatis via Virtual Account, QRIS, dan Retail Outlet.</p>
          </div>
          <form onSubmit={handleSubmitTripay} className={shared.form}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Merchant Code</label>
              <input name="merchantCode" value={tripayData.merchantCode} onChange={handleTripayChange} className={shared.formInput} placeholder="T12345" />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>API Key</label>
              <input name="apiKey" value={tripayData.apiKey} onChange={handleTripayChange} className={shared.formInput} placeholder="DEV-XXX..." />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Private Key</label>
              <input name="privateKey" value={tripayData.privateKey} onChange={handleTripayChange} className={shared.formInput} placeholder="XXX-XXX..." />
            </div>
            <label className="toggle-switch">
              <input type="checkbox" name="isSandbox" checked={tripayData.isSandbox} onChange={handleTripayChange} className="toggle-input" />
              <div className="toggle-slider" />
              <span className="toggle-label" style={{ fontWeight: 600 }}>Gunakan Mode SANDBOX</span>
            </label>
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
              <Button type="submit" leftIcon={<Save size={15} />} isLoading={isSubmitting}>Simpan Pengaturan</Button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Rekening Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Rekening' : 'Tambah Rekening'}>
        <form className={shared.form} onSubmit={handleSubmitManual}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Bank / Dompet <span className="required">*</span></label>
            <input required name="namaBank" value={formData.namaBank} onChange={handleInputChange} className={shared.formInput} placeholder="BCA / Mandiri / ShopeePay" />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nomor Rekening <span className="required">*</span></label>
            <input required name="noRekening" value={formData.noRekening} onChange={handleInputChange} className={shared.formInput} placeholder="0012345678" />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Atas Nama <span className="required">*</span></label>
            <input required name="atasNama" value={formData.atasNama} onChange={handleInputChange} className={shared.formInput} placeholder="Nama Pemilik Rekening" />
          </div>
          <label className="toggle-switch">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
            <div className="toggle-slider" />
            <span className="toggle-label">Rekening Aktif</span>
          </label>
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Rekening</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus rekening <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>?
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
