'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Calendar, Layout, Users } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatDate } from '@/lib/utils'
import shared from '@/styles/page.module.css'

export default function PeriodePpdbPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tahunAjarans, setTahunAjarans] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)

  const [formData, setFormData] = useState({
    nama: '', tahunAjaranId: '', unitId: '',
    tanggalBuka: '', tanggalTutup: '',
    biayaPendaftaran: '', isActive: true,
  })

  const fetchPeriode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ppdb/periode')
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchPeriode()
    Promise.all([fetch('/api/data-master/tahun-ajaran'), fetch('/api/data-master/unit')])
      .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
      .then(([j1, j2]) => {
        if (j1.data) setTahunAjarans(j1.data)
        if (j2.data) setUnits(j2.data)
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ nama: '', tahunAjaranId: tahunAjarans.find(t => t.isActive)?.id || '', unitId: '', tanggalBuka: '', tanggalTutup: '', biayaPendaftaran: '', isActive: true })
    setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
      nama: row.nama, tahunAjaranId: row.tahunAjaranId, unitId: row.unitId || '',
      tanggalBuka: row.tanggalBuka.split('T')[0], tanggalTutup: row.tanggalTutup.split('T')[0],
      biayaPendaftaran: row.pengaturan?.biayaPendaftaran || '', isActive: row.isActive,
    })
    setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/ppdb/periode/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Gelombang berhasil dihapus'); fetchPeriode() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/ppdb/periode/${editId}` : '/api/ppdb/periode',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchPeriode(); toast.success(json.message || 'Gelombang disimpan') }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const formatRp = (val: number) => `Rp ${Number(val).toLocaleString('id-ID')}`

  const filtered = data.filter(d => d.nama.toLowerCase().includes(searchQuery.toLowerCase()))

  const columns: Column<any>[] = [
    {
      header: 'Gelombang / Periode',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><Layout size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.nama}</div>
            <div className={shared.cellSub}>{row.tahunAjaran?.nama}{row.unit ? ` • ${row.unit.nama}` : ''}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Masa Pendaftaran',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--sp-text-sm)' }}>
          <Calendar size={13} style={{ opacity: 0.5 }} />
          {formatDate(row.tanggalBuka)} — {formatDate(row.tanggalTutup)}
        </div>
      ),
    },
    {
      header: 'Biaya Formulir',
      accessor: (row) => (
        <span style={{ fontWeight: 700, fontSize: 'var(--sp-text-sm)' }}>
          {formatRp(row.pengaturan?.biayaPendaftaran || 0)}
        </span>
      ),
    },
    {
      header: 'Pendaftar',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={13} style={{ opacity: 0.5 }} />
          <span style={{ fontWeight: 700 }}>{row._count?.pendaftars || 0}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`${shared.statusBadge} ${row.isActive ? shared.statusActive : shared.statusNeutral}`}>
          {row.isActive ? 'Buka' : 'Tutup'}
        </span>
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
          <h1 className={shared.title}>Gelombang PPDB</h1>
          <p className={shared.subtitle}>Kelola periode pendaftaran siswa baru</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Gelombang</Button>
      </div>

      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari gelombang..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filtered} isLoading={loading} emptyMessage="Belum ada gelombang pendaftaran" />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Gelombang PPDB' : 'Buka Gelombang Baru'} maxWidth="560px">
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Nama Gelombang <span className="required">*</span></label>
            <input required name="nama" value={formData.nama} onChange={handleInputChange} className={shared.formInput} placeholder="Contoh: Gelombang 1 (Reguler)" disabled={isSubmitting} />
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tahun Ajaran <span className="required">*</span></label>
              <select required name="tahunAjaranId" value={formData.tahunAjaranId} onChange={handleInputChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="">Pilih Tahun</option>
                {tahunAjarans.map(t => <option key={t.id} value={t.id}>{t.nama}{t.isActive ? ' (Aktif)' : ''}</option>)}
              </select>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Unit / Jenjang</label>
              <select name="unitId" value={formData.unitId} onChange={handleInputChange} className={shared.formInput} disabled={isSubmitting}>
                <option value="">Semua Unit</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
              </select>
            </div>
          </div>

          <div className={shared.formRow}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tanggal Buka <span className="required">*</span></label>
              <input required name="tanggalBuka" value={formData.tanggalBuka} onChange={handleInputChange} type="date" className={shared.formInput} disabled={isSubmitting} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tanggal Tutup <span className="required">*</span></label>
              <input required name="tanggalTutup" value={formData.tanggalTutup} onChange={handleInputChange} type="date" className={shared.formInput} disabled={isSubmitting} />
            </div>
          </div>

          <div className={shared.formGroup}>
            <label className={shared.formLabel}>Biaya Pendaftaran (Formulir) <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--sp-text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>Rp</span>
              <input
                required name="biayaPendaftaran" value={formData.biayaPendaftaran}
                onChange={handleInputChange} type="number" min="0"
                className={shared.formInput} style={{ paddingLeft: '2.5rem' }}
                placeholder="150000" disabled={isSubmitting}
              />
            </div>
            <span className="form-hint">Biaya ini akan otomatis ditagihkan saat pendaftar mengisi form singkat.</span>
          </div>

          <label className="toggle-switch">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="toggle-input" />
            <div className="toggle-slider" />
            <span className="toggle-label">Aktifkan pendaftaran sekarang</span>
          </label>

          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editId ? 'Simpan Perubahan' : 'Buka Gelombang'}</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus gelombang <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>? Semua data pendaftar di gelombang ini juga akan terhapus.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
