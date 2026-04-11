'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Trash2, Send } from 'lucide-react'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import styles from './page.module.css'

type TabType = 'generate' | 'manual'

export default function TagihanPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter States
  const [filterKelas, setFilterKelas] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [filterTahun] = useState('')

  // Dependency Data
  const [kelases, setKelases] = useState<any[]>([])
  const [kategoris, setKategoris] = useState<any[]>([])
  const [tahunAjarans, setTahunAjarans] = useState<any[]>([])
  const [siswas, setSiswas] = useState<any[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('generate')

  // Form State
  const [formData, setFormData] = useState({
    kategoriId: '',
    tahunAjaranId: '',
    kelasId: '',
    siswaId: '',
    bulan: '',
    nominal: '',
    keterangan: '',
    jatuhTempo: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = '/api/keuangan/tagihan?'
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
      if (filterKelas) url += `&kelasId=${filterKelas}`
      if (filterKategori) url += `&kategoriId=${filterKategori}`
      if (filterTahun) url += `&tahunAjaranId=${filterTahun}`

      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const [resKelases, resKats, resTahun, resSiswas] = await Promise.all([
        fetch('/api/data-master/kelas'),
        fetch('/api/data-master/kategori-tagihan'),
        fetch('/api/data-master/tahun-ajaran'),
        fetch('/api/data-master/siswa')
      ])
      const jsonKelases = await resKelases.json()
      const jsonKats = await resKats.json()
      const jsonTahun = await resTahun.json()
      const jsonSiswas = await resSiswas.json()
      
      if (jsonKelases.data) setKelases(jsonKelases.data)
      if (jsonKats.data) setKategoris(jsonKats.data)
      if (jsonTahun.data) setTahunAjarans(jsonTahun.data)
      if (jsonSiswas.data) setSiswas(jsonSiswas.data)
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
  }, [searchQuery, filterKelas, filterKategori, filterTahun])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const openModal = () => {
    setFormData({ 
      kategoriId: '', tahunAjaranId: '', kelasId: '', siswaId: '',
      bulan: '', nominal: '', keterangan: '', jatuhTempo: '' 
    })
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const endpoint = activeTab === 'generate' 
        ? '/api/keuangan/tagihan/generate' 
        : '/api/keuangan/tagihan'

      const res = await fetch(endpoint, {
        method: 'POST',
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
    } catch {
      setErrorMsg('Gagal terhubung ke server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus tagihan untuk "${name}"?`)) return
    try {
      const res = await fetch(`/api/keuangan/tagihan/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok) {
        fetchData()
      } else {
        alert(json.error)
      }
    } catch {
      alert('Gagal menghapus')
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Siswa',
      accessor: (row) => (
        <div className={styles.userCell}>
          <div>
            <div className={styles.name}>{row.siswa?.namaLengkap}</div>
            <div className={styles.subtext}>{row.siswa?.nis} • {row.siswa?.kelas?.nama}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Kategori',
      accessor: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.kategori?.nama}</div>
          <div className={styles.subtext}>{row.bulan ? `${row.bulan} ` : ''}{row.tahunAjaran?.nama}</div>
        </div>
      )
    },
    {
      header: 'Nominal',
      accessor: (row) => (
        <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
          {formatCurrency(Number(row.nominal))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={styles.statusBadge} data-status={row.status}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Aksi',
      align: 'center',
      width: '100px',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button className={styles.actionBtn} title="Hapus" onClick={(e) => {
              e.stopPropagation()
              handleDelete(row.id, row.siswa?.namaLengkap)
          }}>
            <Trash2 size={14} style={{ color: 'var(--danger-500)' }} />
          </button>
        </div>
      ),
    },
  ]

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tagihan Siswa</h1>
          <p className={styles.subtitle}>Kelola dan buat tagihan biaya pendidikan siswa</p>
        </div>
        <button className={styles.addBtn} onClick={openModal}>
          <Send size={18} />
          <span>Buat Tagihan</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.filters}>
            <select className={styles.filterSelect} value={filterKelas} onChange={e => setFilterKelas(e.target.value)}>
                <option value="">Semua Kelas</option>
                {kelases.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            <select className={styles.filterSelect} value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
                <option value="">Semua Kategori</option>
                {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="Belum ada data tagihan"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Buat Tagihan Baru"
      >
        <div className={styles.modalTabs}>
           <button 
             className={cn(styles.tabBtn, activeTab === 'generate' && styles.tabActive)} 
             onClick={() => setActiveTab('generate')}
           >
             Generator Massal
           </button>
           <button 
             className={cn(styles.tabBtn, activeTab === 'manual' && styles.tabActive)} 
             onClick={() => setActiveTab('manual')}
           >
             Input Manual
           </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
          
          <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Kategori Tagihan</label>
                <select required name="kategoriId" value={formData.kategoriId} onChange={handleInputChange} className={styles.input}>
                    <option value="">Pilih Kategori</option>
                    {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tahun Ajaran</label>
                <select required name="tahunAjaranId" value={formData.tahunAjaranId} onChange={handleInputChange} className={styles.input}>
                    <option value="">Pilih Tahun</option>
                    {tahunAjarans.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
              </div>
          </div>

          {activeTab === 'generate' ? (
            <div className={styles.formGroup}>
                <label className={styles.label}>Target Kelas (Opsional)</label>
                <select name="kelasId" value={formData.kelasId} onChange={handleInputChange} className={styles.input}>
                    <option value="">Semua Kelas</option>
                    {kelases.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
                <p className={styles.subtext} style={{marginTop: '4px'}}>Jika kosong, tagihan akan dibuat untuk seluruh siswa aktif.</p>
            </div>
          ) : (
            <div className={styles.formGroup}>
                <label className={styles.label}>Pilih Siswa</label>
                <select required name="siswaId" value={formData.siswaId} onChange={handleInputChange} className={styles.input}>
                    <option value="">Cari Siswa</option>
                    {siswas.map(s => <option key={s.id} value={s.id}>{s.namaLengkap} ({s.nis})</option>)}
                </select>
            </div>
          )}

          <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bulan (Kosongkan jika bukan bulanan)</label>
                <select name="bulan" value={formData.bulan} onChange={handleInputChange} className={styles.input}>
                    <option value="">Pilih Bulan</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nominal Tagihan</label>
                <input required name="nominal" type="number" value={formData.nominal} onChange={handleInputChange} className={styles.input} placeholder="Contoh: 500000" />
              </div>
          </div>

          <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Jatuh Tempo (Opsional)</label>
                <input name="jatuhTempo" type="date" value={formData.jatuhTempo} onChange={handleInputChange} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Keterangan</label>
                <input name="keterangan" value={formData.keterangan} onChange={handleInputChange} className={styles.input} placeholder="Catatan tambahan..." />
              </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Batal</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className={cn(styles.spinner, "animate-spin")} size={18} /> : (activeTab === 'generate' ? 'Generate Sekarang' : 'Simpan Tagihan')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
