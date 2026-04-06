'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2, User, Users, Home, Phone, Mail, Camera, GraduationCap, Building2 } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import styles from './page.module.css'

type TabType = 'profil' | 'kontak' | 'orangtua' | 'akademik'

export default function SiswaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dependency Data
  const [units, setUnits] = useState<any[]>([])
  const [kelases, setKelases] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profil')

  // Form State
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    namaLengkap: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    telepon: '',
    fotoUrl: '',
    namaWali: '',
    teleponWali: '',
    emailWali: '',
    kelasId: '',
    unitId: '',
    status: 'AKTIF',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = searchQuery 
        ? `/api/data-master/siswa?search=${encodeURIComponent(searchQuery)}` 
        : '/api/data-master/siswa'
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

  const fetchDependencies = async () => {
    try {
      const [resUnits, resKelases] = await Promise.all([
        fetch('/api/data-master/unit'),
        fetch('/api/data-master/kelas')
      ])
      const jsonUnits = await resUnits.json()
      const jsonKelases = await resKelases.json()
      
      if (jsonUnits.data) setUnits(jsonUnits.data)
      if (jsonKelases.data) setKelases(jsonKelases.data)
    } catch (e) {
      console.error('Error fetching dependencies', e)
    }
  }

  useEffect(() => {
    fetchDependencies()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setEditId(null)
    setFormData({ 
      nis: '', nisn: '', namaLengkap: '', jenisKelamin: 'LAKI_LAKI', 
      tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', 
      fotoUrl: '', namaWali: '', teleponWali: '', emailWali: '', 
      kelasId: '', unitId: '', status: 'AKTIF' 
    })
    setActiveTab('profil')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (row: any) => {
    setEditId(row.id)
    setFormData({
        nis: row.nis,
        nisn: row.nisn || '',
        namaLengkap: row.namaLengkap,
        jenisKelamin: row.jenisKelamin || 'LAKI_LAKI',
        tempatLahir: row.tempatLahir || '',
        tanggalLahir: row.tanggalLahir ? row.tanggalLahir.split('T')[0] : '',
        alamat: row.alamat || '',
        telepon: row.telepon || '',
        fotoUrl: row.fotoUrl || '',
        namaWali: row.namaWali || '',
        teleponWali: row.teleponWali || '',
        emailWali: row.emailWali || '',
        kelasId: row.kelasId || '',
        unitId: row.unitId || '',
        status: row.status,
    })
    setActiveTab('profil')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus siswa "${name}"?`)) return

    try {
        const res = await fetch(`/api/data-master/siswa/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!res.ok) {
            alert(json.error || 'Gagal menghapus data')
        } else {
            alert('Siswa berhasil dihapus')
            fetchData()
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
      const url = isEditing ? `/api/data-master/siswa/${editId}` : '/api/data-master/siswa'
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
        fetchData()
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
      header: 'Bio Siswa',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            {row.fotoUrl ? <img src={row.fotoUrl} alt={row.namaLengkap} /> : <User size={18} />}
          </div>
          <div>
            <div className={styles.name}>{row.namaLengkap}</div>
            <div className={styles.username}>NIS: {row.nis}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Kelas & Unit',
      accessor: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '2px' }}>
             <GraduationCap size={14} style={{ opacity: 0.5 }} />
             <span style={{ fontWeight: 500 }}>{row.kelas?.nama || '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
             <Building2 size={12} style={{ opacity: 0.5 }} />
             <span>{row.unit?.nama || '-'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        const variant = row.status === 'AKTIF' ? 'active' : row.status === 'LULUS' ? 'completed' : 'danger'
        return (
          <span className={styles.statusBadge} data-active={row.status === 'AKTIF'}>
             {row.status}
          </span>
        )
      }
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
          <button className={styles.actionBtn} style={{ color: 'var(--danger-500)' }} onClick={() => handleDelete(row.id, row.namaLengkap)} title="Hapus">
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
          <h1 className={styles.title}>Data Siswa</h1>
          <p className={styles.subtitle}>Kelola profil, akademik, dan status siswa</p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <Plus size={18} />
          <span>Tambah Siswa</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari NIS atau nama..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Data siswa belum tersedia"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editId ? "Edit Profil Siswa" : "Tambah Siswa Baru"}
      >
        <div className={styles.modalTabs}>
           <button className={cn(styles.tabBtn, activeTab === 'profil' && styles.tabActive)} onClick={() => setActiveTab('profil')}><User size={16} /> Profil</button>
           <button className={cn(styles.tabBtn, activeTab === 'kontak' && styles.tabActive)} onClick={() => setActiveTab('kontak')}><Home size={16} /> Kontak</button>
           <button className={cn(styles.tabBtn, activeTab === 'orangtua' && styles.tabActive)} onClick={() => setActiveTab('orangtua')}><Users size={16} /> Wali</button>
           <button className={cn(styles.tabBtn, activeTab === 'akademik' && styles.tabActive)} onClick={() => setActiveTab('akademik')}><GraduationCap size={16} /> Akademik</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
          
          {activeTab === 'profil' && (
            <div className={styles.tabContent}>
              <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>NIS</label>
                    <input required name="nis" value={formData.nis} onChange={handleInputChange} type="text" className={styles.input} placeholder="Nomor Induk Siswa" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>NISN</label>
                    <input name="nisn" value={formData.nisn} onChange={handleInputChange} type="text" className={styles.input} placeholder="Nomor Induk Siswa Nasional" />
                  </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Lengkap</label>
                <input required name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} type="text" className={styles.input} placeholder="Nama sesuai identitas" />
              </div>
              <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Jenis Kelamin</label>
                    <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className={styles.input}>
                        <option value="LAKI_LAKI">Laki-laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tempat Lahir</label>
                    <input name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} type="text" className={styles.input} placeholder="Nama Kota" />
                  </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tanggal Lahir</label>
                <input name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} type="date" className={styles.input} />
              </div>
            </div>
          )}

          {activeTab === 'kontak' && (
            <div className={styles.tabContent}>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Alamat Lengkap</label>
                  <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className={styles.input} rows={4} placeholder="Alamat tinggal saat ini"></textarea>
               </div>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor Telepon</label>
                  <input name="telepon" value={formData.telepon} onChange={handleInputChange} type="text" className={styles.input} placeholder="08xxxx" />
               </div>
            </div>
          )}

          {activeTab === 'orangtua' && (
            <div className={styles.tabContent}>
               <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Wali / Orang Tua</label>
                    <input name="namaWali" value={formData.namaWali} onChange={handleInputChange} type="text" className={styles.input} placeholder="Nama Lengkap" />
               </div>
               <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Telepon Wali</label>
                        <input name="teleponWali" value={formData.teleponWali} onChange={handleInputChange} type="text" className={styles.input} placeholder="08xxxx" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Wali</label>
                        <input name="emailWali" value={formData.emailWali} onChange={handleInputChange} type="email" className={styles.input} placeholder="email@example.com" />
                    </div>
               </div>
            </div>
          )}

          {activeTab === 'akademik' && (
            <div className={styles.tabContent}>
               <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Unit / Jenjang</label>
                    <select name="unitId" value={formData.unitId} onChange={handleInputChange} className={styles.input}>
                        <option value="">Pilih Unit</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.nama}</option>
                        ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kelas</label>
                    <select name="kelasId" value={formData.kelasId} onChange={handleInputChange} className={styles.input}>
                        <option value="">Pilih Kelas</option>
                        {kelases.map(k => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>
                  </div>
               </div>
               <div className={styles.formGroup}>
                  <label className={styles.label}>Status Siswa</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className={styles.input}>
                      <option value="AKTIF">Aktif</option>
                      <option value="TIDAK_AKTIF">Tidak Aktif</option>
                      <option value="LULUS">Lulus</option>
                      <option value="PINDAH">Pindah</option>
                  </select>
               </div>
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className={styles.spinner} /> : 'Simpan Data Siswa'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
