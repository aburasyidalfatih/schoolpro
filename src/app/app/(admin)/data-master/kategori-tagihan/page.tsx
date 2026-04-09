'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CreditCard, History, CircleCheck, CircleX } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

export default function KategoriTagihanPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [formData, setFormData] = useState({ nama: '', kode: '', isBulanan: false, isActive: true })

  const fetchKategori = async () => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/data-master/kategori-tagihan?search=${encodeURIComponent(searchQuery)}` : '/api/data-master/kategori-tagihan'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => { const t = setTimeout(fetchKategori, 300); return () => clearTimeout(t) }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const openAddModal = () => {
    setEditId(null); setFormData({ nama: '', kode: '', isBulanan: false, isActive: true }); setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id); setFormData({ nama: row.nama, kode: row.kode, isBulanan: row.isBulanan, isActive: row.isActive }); setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/kategori-tagihan/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Kategori berhasil dihapus'); fetchKategori() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/data-master/kategori-tagihan/${editId}` : '/api/data-master/kategori-tagihan',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchKategori(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    {
      header: 'Kategori Tagihan',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><CreditCard size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>Kode: {row.kode}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipe',
      accessor: (row) => row.isBulanan
        ? <span className="badge badge-primary"><History size={11} style={{ marginRight: 4 }} />Bulanan</span>
        : <span className="badge badge-gray">Sekali Bayar</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-sm)' }}>
          {row.isActive
            ? <><CircleCheck size={14} style={{ color: 'var(--success-500)' }} /><span>Aktif</span></>
            : <><CircleX size={14} style={{ color: 'var(--danger-500)' }} /><span>Non-Aktif</span></>}
        </div>
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
          <h1 className={shared.title}>Kategori Tagihan</h1>
          <p className={shared.subtitle}>Atur jenis-jenis komponen biaya pendidikan siswa</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Kategori Baru</Button>
      </div>
      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari kategori atau kode..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada kategori tagihan" />

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Kategori Tagihan' : 'Tambah Kategori Tagihan'}>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Kategori <span className="required">*</span></label>
            <input required name="nama" value={formData.nama} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: SPP Bulanan, Uang Buku" disabled={isSubmitting} />
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Kode Kategori <span className="required">*</span></label>
            <input required name="kode" value={formData.kode} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: SPP, BK1" disabled={isSubmitting} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <label className="toggle-switch">
              <input type="checkbox" name="isBulanan" checked={formData.isBulanan} onChange={handleInputChange} className="toggle-input" />
              <div className="toggle-slider" />
              <span className="toggle-label">Tagihan Bulanan</span>
            </label>
            <label className="toggle-switch">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
              <div className="toggle-slider" />
              <span className="toggle-label">Aktif</span>
            </label>
          </div>
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Kategori</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus kategori <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>?
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
