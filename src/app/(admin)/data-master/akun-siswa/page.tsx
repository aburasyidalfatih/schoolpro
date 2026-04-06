'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, Key, ShieldCheck, UserPlus, RefreshCw, User, GraduationCap } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import styles from './page.module.css'

export default function AkunSiswaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAccount, setFilterAccount] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedSiswaName, setSelectedSiswaName] = useState('')

  // Form State
  const [password, setPassword] = useState('')

  const fetchAkunSiswa = async () => {
    setLoading(true)
    try {
      let url = `/api/data-master/akun-siswa?search=${encodeURIComponent(searchQuery)}`
      if (filterAccount === 'has') url += '&hasAccount=true'
      if (filterAccount === 'no') url += '&hasAccount=false'
      
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAkunSiswa()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterAccount])

  const openCreateModal = (siswa: any) => {
    setSelectedSiswaId(siswa.id)
    setSelectedUserId(null)
    setSelectedSiswaName(siswa.namaLengkap)
    setPassword(siswa.nis) // Default password = NIS
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openResetModal = (siswa: any) => {
    setSelectedSiswaId(null)
    setSelectedUserId(siswa.user.id)
    setSelectedSiswaName(siswa.namaLengkap)
    setPassword('')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleGenerateAll = async () => {
    if (!window.confirm('Apakah Anda ingin membuat akun secara otomatis untuk semua siswa yang belum memiliki akun?\n\nPassword standar akan disetel ke: "Siswa123!"')) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/data-master/akun-siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-all' }),
      })
      const json = await res.json()
      if (res.ok) {
        alert(json.message)
        fetchAkunSiswa()
      } else {
        alert(json.error || 'Gagal generate akun')
      }
    } catch (e) {
      alert('Terjadi kesalahan server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus AKUN (login) untuk siswa "${name}"?\nData profil siswa TIDAK akan terhapus.`)) return

    try {
        const res = await fetch(`/api/data-master/akun-siswa/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus akun')
        } else {
            alert('Akun berhasil dihapus')
            fetchAkunSiswa()
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
      const isReset = !!selectedUserId
      const url = isReset ? `/api/data-master/akun-siswa/${selectedUserId}` : '/api/data-master/akun-siswa'
      const method = isReset ? 'PUT' : 'POST'
      const payload = isReset ? { password } : { siswaId: selectedSiswaId, password }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error || 'Terjadi kesalahan')
      } else {
        setIsModalOpen(false)
        fetchAkunSiswa()
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
      header: 'Nama Siswa',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            <GraduationCap size={18} />
          </div>
          <div>
            <div className={styles.name}>{row.namaLengkap}</div>
            <div className={styles.username}>NIS: {row.nis} • {row.kelas?.nama || 'No Kelas'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Username Akun',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.user ? (
            <span className={styles.roleBadge} style={{ background: 'var(--success-50)', color: 'var(--success-700)', textTransform: 'none' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                {row.user.username}
            </span>
          ) : (
            <span className={styles.roleBadge} style={{ background: 'var(--warning-50)', color: 'var(--warning-700)', textTransform: 'none' }}>
                Belum Ada Akun
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => row.user ? (
        <span className={styles.statusBadge} data-active={row.user.isActive}>
          {row.user.isActive ? 'Aktif' : 'Blokir'}
        </span>
      ) : '-',
    },
    {
      header: 'Aksi Keamanan',
      align: 'center',
      width: '200px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {row.user ? (
            <>
              <button 
                className={styles.actionBtn} 
                title="Reset Password"
                onClick={() => openResetModal(row)}
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                <Key size={14} />
              </button>
              <button 
                className={styles.actionBtn} 
                style={{ color: 'var(--danger-500)', backgroundColor: 'var(--danger-50)' }}
                title="Hapus Akun"
                onClick={() => handleDeleteAccount(row.user.id, row.namaLengkap)}
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button 
                className={styles.actionBtn} 
                onClick={() => openCreateModal(row)}
                title="Buat Akun"
                style={{ width: 'auto', padding: '0.25rem 0.75rem', gap: '0.4rem', border: '1px solid var(--primary-100)', color: 'var(--primary-700)', background: 'var(--primary-50)' }}
            >
                <UserPlus size={14} />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>AKTIVASI</span>
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Akun Siswa</h1>
          <p className={styles.subtitle}>Kelola login dan keamanan akses portal siswa</p>
        </div>
        <button 
          className={cn(styles.addBtn, isSubmitting && styles.btnLoading)} 
          onClick={handleGenerateAll}
          disabled={isSubmitting}
          style={{ background: 'var(--success-600)', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
        >
          {isSubmitting ? <Loader2 size={18} className={styles.spinner} /> : <RefreshCw size={18} />}
          <span>Generate Massal</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari siswa..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select 
            className={styles.filterBtn}
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="all">Semua Siswa</option>
            <option value="has">Sudah Berakun</option>
            <option value="no">Belum Berakun</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Data siswa tidak ditemukan"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedUserId ? "Reset Password Siswa" : "Buat Akun Siswa"}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && (
            <div className={styles.errorText} style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#b91c1c' }}>
              {errorMsg}
            </div>
          )}
          
          <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Nama Siswa</div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedSiswaName}</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
                {selectedUserId ? "Password Baru" : "Setel Password"}
            </label>
            <div style={{ position: 'relative' }}>
                <input 
                    required
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="text" // Plain text for clarity in this master tool
                    className={styles.input} 
                    placeholder="Minimal 6 karakter" 
                    disabled={isSubmitting}
                />
                <Key size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            </div>
            {!selectedUserId && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Default password disarankan menggunakan NIS siswa.</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className={styles.actionBtn} 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              style={{ background: 'var(--bg-hover)', color: 'var(--text-color)', padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', width: 'auto' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isSubmitting}
              style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              {isSubmitting ? <Loader2 className={styles.spinner} /> : (selectedUserId ? 'Perbarui Password' : 'Aktifkan Akun')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
