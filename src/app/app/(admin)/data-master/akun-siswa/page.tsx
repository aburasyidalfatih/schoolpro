'use client'

import { useState, useEffect } from 'react'
import { Loader2, Pencil, Trash2, Key, ShieldCheck, UserPlus, RefreshCw, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import shared from '@/styles/page.module.css'

export default function AkunSiswaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAccount, setFilterAccount] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedSiswaName, setSelectedSiswaName] = useState('')
  const [password, setPassword] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  const fetchAkunSiswa = async () => {
    setLoading(true)
    try {
      let url = `/api/data-master/akun-siswa?search=${encodeURIComponent(searchQuery)}`
      if (filterAccount === 'has') url += '&hasAccount=true'
      if (filterAccount === 'no') url += '&hasAccount=false'
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  useEffect(() => { const t = setTimeout(fetchAkunSiswa, 300); return () => clearTimeout(t) }, [searchQuery, filterAccount])

  const openCreateModal = (siswa: any) => {
    setSelectedSiswaId(siswa.id); setSelectedUserId(null); setSelectedSiswaName(siswa.namaLengkap)
    setPassword(siswa.nis); setErrorMsg(''); setIsModalOpen(true)
  }

  const openResetModal = (siswa: any) => {
    setSelectedSiswaId(null); setSelectedUserId(siswa.user.id); setSelectedSiswaName(siswa.namaLengkap)
    setPassword(''); setErrorMsg(''); setIsModalOpen(true)
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/data-master/akun-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-all' }),
      })
      const json = await res.json()
      if (res.ok) { toast.success(json.message); fetchAkunSiswa() }
      else toast.error(json.error || 'Gagal generate akun')
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setIsGenerating(false); setConfirmGenerate(false) }
  }

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/data-master/akun-siswa/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) toast.error(json.error || 'Gagal menghapus akun')
      else { toast.success('Akun berhasil dihapus'); fetchAkunSiswa() }
    } catch { toast.error('Terjadi kesalahan server') }
    finally { setDeleteTarget(null) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('')
    try {
      const isReset = !!selectedUserId
      const res = await fetch(
        isReset ? `/api/data-master/akun-siswa/${selectedUserId}` : '/api/data-master/akun-siswa',
        { method: isReset ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isReset ? { password } : { siswaId: selectedSiswaId, password }) }
      )
      const json = await res.json()
      if (!res.ok) setErrorMsg(json.error || 'Terjadi kesalahan')
      else { setIsModalOpen(false); fetchAkunSiswa(); toast.success(json.message) }
    } catch { setErrorMsg('Gagal terhubung ke server') }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    {
      header: 'Nama Siswa',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}><GraduationCap size={16} /></div>
          <div>
            <div className={shared.cellName}>{row.namaLengkap}</div>
            <div className={shared.cellSub}>NIS: {row.nis} • {row.kelas?.nama || 'No Kelas'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Username Akun',
      accessor: (row) => row.user
        ? <span className="badge badge-success"><ShieldCheck size={11} style={{ marginRight: 4 }} />{row.user.username}</span>
        : <span className="badge badge-warning">Belum Ada Akun</span>,
    },
    {
      header: 'Status',
      accessor: (row) => row.user
        ? <span className={`${shared.statusBadge} ${row.user.isActive ? shared.statusActive : shared.statusInactive}`}>{row.user.isActive ? 'Aktif' : 'Diblokir'}</span>
        : <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>—</span>,
    },
    {
      header: 'Aksi', align: 'center', width: '200px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {row.user ? (
            <>
              <button className={shared.actionBtn} title="Reset Password" onClick={() => openResetModal(row)}><Key size={14} /></button>
              <button className={`${shared.actionBtn} ${shared.actionBtnDanger}`} title="Hapus Akun" onClick={() => setDeleteTarget({ id: row.user.id, nama: row.namaLengkap })}><Trash2 size={14} /></button>
            </>
          ) : (
            <Button size="sm" variant="secondary" leftIcon={<UserPlus size={13} />} onClick={() => openCreateModal(row)}>Aktivasi</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Manajemen Akun Siswa</h1>
          <p className={shared.subtitle}>Kelola login dan keamanan akses portal siswa</p>
        </div>
        <Button variant="success" leftIcon={isGenerating ? <Loader2 size={16} className={shared.spinner} /> : <RefreshCw size={16} />} onClick={() => setConfirmGenerate(true)} isLoading={isGenerating}>
          Generate Massal
        </Button>
      </div>

      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari siswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select className="form-input" style={{ width: 'auto' }} value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
          <option value="all">Semua Siswa</option>
          <option value="has">Sudah Berakun</option>
          <option value="no">Belum Berakun</option>
        </select>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Data siswa tidak ditemukan" />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={selectedUserId ? 'Reset Password Siswa' : 'Buat Akun Siswa'}>
        <form className={shared.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Nama Siswa</div>
            <div style={{ fontWeight: 600 }}>{selectedSiswaName}</div>
          </div>
          <div className={shared.formGroup}>
            <label className={shared.formLabel}>{selectedUserId ? 'Password Baru' : 'Setel Password'} <span className="required">*</span></label>
            <input required name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="text" className={shared.formInput} placeholder="Minimal 6 karakter" disabled={isSubmitting} />
            {!selectedUserId && <span className="form-hint">Default: gunakan NIS siswa sebagai password awal.</span>}
          </div>
          <div className={shared.modalFooter}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{selectedUserId ? 'Perbarui Password' : 'Aktifkan Akun'}</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Generate Modal */}
      <Modal isOpen={confirmGenerate} onClose={() => setConfirmGenerate(false)} title="Generate Akun Massal">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          Buat akun secara otomatis untuk semua siswa yang belum memiliki akun?
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
          Password standar: <strong>Siswa123!</strong>
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setConfirmGenerate(false)}>Batal</Button>
          <Button variant="success" onClick={handleGenerateAll} isLoading={isGenerating}>Ya, Generate Sekarang</Button>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Akun Siswa">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          Hapus akun login untuk <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.nama}</strong>?
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
          Data profil siswa tidak akan terhapus.
        </p>
        <div className={shared.modalFooter}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>Ya, Hapus Akun</Button>
        </div>
      </Modal>
    </div>
  )
}
