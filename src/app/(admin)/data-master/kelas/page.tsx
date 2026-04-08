'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, LayoutGrid, Building2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

export default function KelasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [units, setUnits] = useState<any[]>([])
  const [tahunAjarans, setTahunAjarans] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [formData, setFormData] = useState({ nama: '', unitId: '', tahunAjaranId: '', tingkat: '', kapasitas: 32 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/data-master/kelas?search=${encodeURIComponent(searchQuery)}` : '/api/data-master/kelas'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  const fetchDependencies = async () => {
    try {
      const [resUnits, resTA] = await Promise.all([fetch('/api/data-master/unit'), fetch('/api/data-master/tahun-ajaran')])
      const [jsonUnits, jsonTA] = await Promise.all([resUnits.json(), resTA.json()])
      if (jsonUnits.data) setUnits(jsonUnits.data)
      if (jsonTA.data) setTahunAjarans(jsonTA.data)
    } catch { console.error('Error fetching dependencies') }
  }

  useEffect(() => { fetchDependencies() }, [])
  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t) }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'kapasitas' ? Number(value) : value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ nama: '', unitId: units[0]?.id || '', tahunAjaranId: tahunAjarans.find(ta => ta.isActive)?.id || tahunAjarans[0]?.id || '', tingkat: '', kapasitas: 32 })
    setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({ nama: row.nama, unitId: row.unitId, tahunAjaranId: row.tahunAjaranId, tingkat: row.tingkat || '', kapasitas: row.kapasitas })
    setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/kelas/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Kelas berhasil dihapus'); fetchData() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/data-master/kelas/${editId}` : '/api/data-master/kelas',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchData(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    {
      header: 'Info Kelas',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><LayoutGrid size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>Tingkat {row.tingkat || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Unit / Jenjang',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
          <Building2 size={14} style={{ opacity: 0.5 }} />{row.unit?.nama}
        </div>
      ),
    },
    {
      header: 'Tahun Ajaran',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
          <Calendar size={14} style={{ opacity: 0.5 }} />{row.tahunAjaran?.nama}
        </div>
      ),
    },
    {
      header: 'Kapasitas', align: 'center',
      accessor: (row) => <span className="badge badge-gray">{row.kapasitas} Siswa</span>,
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
          <h1 className={shared.title}>Data Kelas</h1>
          <p className={shared.subtitle}>Kelola daftar kelas dan rombongan belajar</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Kelas</Button>
      </div>
      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari nama kelas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada data kelas" />

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Kelas <span className="required">*</span></label>
            <input required name="nama" value={formData.nama} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: Kelas 1A, X MIPA 1" disabled={isSubmitting} />
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Unit / Jenjang <span className="required">*</span></label>
              <select required name="unitId" value={formData.unitId} onChange={handleInputChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="">Pilih Unit</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.kode})</option>)}
              </select>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tahun Ajaran <span className="required">*</span></label>
              <select required name="tahunAjaranId" value={formData.tahunAjaranId} onChange={handleInputChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="">Pilih Tahun</option>
                {tahunAjarans.map(ta => <option key={ta.id} value={ta.id}>{ta.nama}{ta.isActive ? ' (Aktif)' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tingkat</label>
              <input name="tingkat" value={formData.tingkat} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: 1, 10, atau VII" disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Kapasitas (Siswa) <span className="required">*</span></label>
              <input required name="kapasitas" value={formData.kapasitas} onChange={handleInputChange} type="number" className={shared.formInput} placeholder="32" disabled={isSubmitting} />
            </div>
          </div>
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Kelas</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus kelas <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>?
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
