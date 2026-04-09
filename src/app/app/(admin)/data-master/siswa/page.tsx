'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, User, Users, Home, Phone, GraduationCap, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/lib/utils'
import shared from '@/styles/page.module.css'

type TabType = 'profil' | 'kontak' | 'orangtua' | 'akademik'

export default function SiswaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [units, setUnits] = useState<any[]>([])
  const [kelases, setKelases] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profil')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)

  const [formData, setFormData] = useState({
    nis: '', nisn: '', namaLengkap: '', jenisKelamin: 'LAKI_LAKI',
    tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '',
    fotoUrl: '', namaWali: '', teleponWali: '', emailWali: '',
    kelasId: '', unitId: '', status: 'AKTIF',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/data-master/siswa?search=${encodeURIComponent(searchQuery)}` : '/api/data-master/siswa'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  const fetchDependencies = async () => {
    try {
      const [resUnits, resKelases] = await Promise.all([fetch('/api/data-master/unit'), fetch('/api/data-master/kelas')])
      const [jsonUnits, jsonKelases] = await Promise.all([resUnits.json(), resKelases.json()])
      if (jsonUnits.data) setUnits(jsonUnits.data)
      if (jsonKelases.data) setKelases(jsonKelases.data)
    } catch { console.error('Error fetching dependencies') }
  }

  useEffect(() => { fetchDependencies() }, [])
  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t) }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const emptyForm = { nis: '', nisn: '', namaLengkap: '', jenisKelamin: 'LAKI_LAKI', tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', fotoUrl: '', namaWali: '', teleponWali: '', emailWali: '', kelasId: '', unitId: '', status: 'AKTIF' }

  const openAddModal = () => {
    setEditId(null); setFormData(emptyForm); setActiveTab('profil'); setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({ nis: row.nis, nisn: row.nisn || '', namaLengkap: row.namaLengkap, jenisKelamin: row.jenisKelamin || 'LAKI_LAKI', tempatLahir: row.tempatLahir || '', tanggalLahir: row.tanggalLahir ? row.tanggalLahir.split('T')[0] : '', alamat: row.alamat || '', telepon: row.telepon || '', fotoUrl: row.fotoUrl || '', namaWali: row.namaWali || '', teleponWali: row.teleponWali || '', emailWali: row.emailWali || '', kelasId: row.kelasId || '', unitId: row.unitId || '', status: row.status })
    setActiveTab('profil'); setErrorMsg(''); setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/siswa/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus')
      else { toast.success('Siswa berhasil dihapus'); fetchData() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isEditing = !!editId
      const res = await fetch(
        isEditing ? `/api/data-master/siswa/${editId}` : '/api/data-master/siswa',
        { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchData(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const STATUS_COLORS: Record<string, string> = { AKTIF: 'success', TIDAK_AKTIF: 'danger', LULUS: 'primary', PINDAH: 'warning' }

  const columns: Column<any>[] = [
    {
      header: 'Bio Siswa',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}>
            {row.fotoUrl ? <img src={row.fotoUrl} alt={row.namaLengkap} /> : <User size={16} />}
          </div>
          <div>
            <div className={shared.cellName}>{row.namaLengkap}</div>
            <div className={shared.cellSub}>NIS: {row.nis}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Kelas & Unit',
      accessor: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '2px' }}>
            <GraduationCap size={13} style={{ opacity: 0.5 }} />
            <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{row.kelas?.nama || '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building2 size={12} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{row.unit?.nama || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`badge badge-${STATUS_COLORS[row.status] || 'gray'}`}>{row.status}</span>
      ),
    },
    {
      header: 'Aksi', align: 'center', width: '120px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={shared.actionBtn} onClick={() => openEditModal(row)} title="Edit"><Pencil size={14} /></button>
          <button className={`${shared.actionBtn} ${shared.actionBtnDanger}`} onClick={() => setDeleteTarget({ id: row.id, nama: row.namaLengkap })} title="Hapus"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'profil', label: 'Profil', icon: <User size={15} /> },
    { key: 'kontak', label: 'Kontak', icon: <Home size={15} /> },
    { key: 'orangtua', label: 'Wali', icon: <Users size={15} /> },
    { key: 'akademik', label: 'Akademik', icon: <GraduationCap size={15} /> },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Data Siswa</h1>
          <p className={shared.subtitle}>Kelola profil, akademik, dan status siswa</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Siswa</Button>
      </div>
      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari NIS atau nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Data siswa belum tersedia" />

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editId ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'} maxWidth="580px">
        {/* Tabs */}
        <div className={shared.modalTabs}>
          {tabs.map(tab => (
            <button key={tab.key} className={cn(shared.tabBtn, activeTab === tab.key && shared.tabActive)} onClick={() => setActiveTab(tab.key)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}

          {activeTab === 'profil' && (
            <div className={shared.tabContent}>
              <div className={shared.formRow}>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>NIS <span className="required">*</span></label>
                  <input required name="nis" value={formData.nis} onChange={handleInputChange} className={shared.formInput} placeholder="Nomor Induk Siswa" />
                </div>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>NISN</label>
                  <input name="nisn" value={formData.nisn} onChange={handleInputChange} className={shared.formInput} placeholder="Nomor Induk Nasional" />
                </div>
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Nama Lengkap <span className="required">*</span></label>
                <input required name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} className={shared.formInput} placeholder="Nama sesuai identitas" />
              </div>
              <div className={shared.formRow}>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Jenis Kelamin</label>
                  <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className={shared.formInput}>
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Tempat Lahir</label>
                  <input name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} className={shared.formInput} placeholder="Nama Kota" />
                </div>
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Tanggal Lahir</label>
                <input name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} type="date" className={shared.formInput} />
              </div>
            </div>
          )}

          {activeTab === 'kontak' && (
            <div className={shared.tabContent}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Alamat Lengkap</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className={shared.formInput} rows={4} placeholder="Alamat tinggal saat ini" style={{ resize: 'vertical' }} />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Nomor Telepon</label>
                <input name="telepon" value={formData.telepon} onChange={handleInputChange} className={shared.formInput} placeholder="08xxxx" />
              </div>
            </div>
          )}

          {activeTab === 'orangtua' && (
            <div className={shared.tabContent}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Nama Wali / Orang Tua</label>
                <input name="namaWali" value={formData.namaWali} onChange={handleInputChange} className={shared.formInput} placeholder="Nama Lengkap" />
              </div>
              <div className={shared.formRow}>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Telepon Wali</label>
                  <input name="teleponWali" value={formData.teleponWali} onChange={handleInputChange} className={shared.formInput} placeholder="08xxxx" />
                </div>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Email Wali</label>
                  <input name="emailWali" value={formData.emailWali} onChange={handleInputChange} type="email" className={shared.formInput} placeholder="email@example.com" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'akademik' && (
            <div className={shared.tabContent}>
              <div className={shared.formRow}>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Unit / Jenjang</label>
                  <select name="unitId" value={formData.unitId} onChange={handleInputChange} className={shared.formInput}>
                    <option value="">Pilih Unit</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                  </select>
                </div>
                <div className={shared.formGroup}>
                  <label className={shared.formLabel}>Kelas</label>
                  <select name="kelasId" value={formData.kelasId} onChange={handleInputChange} className={shared.formInput}>
                    <option value="">Pilih Kelas</option>
                    {kelases.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Status Siswa</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={shared.formInput}>
                  <option value="AKTIF">Aktif</option>
                  <option value="TIDAK_AKTIF">Tidak Aktif</option>
                  <option value="LULUS">Lulus</option>
                  <option value="PINDAH">Pindah</option>
                </select>
              </div>
            </div>
          )}

          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>Simpan Data Siswa</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          Hapus siswa <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>? Semua tagihan terkait juga akan terhapus.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
