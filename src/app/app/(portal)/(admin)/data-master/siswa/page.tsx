'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, User, GraduationCap, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { SiswaDeleteModal } from '@/features/data-master/components/SiswaDeleteModal'
import { SiswaFormModal } from '@/features/data-master/components/SiswaFormModal'
import type { KelasOption, PaginationState, SiswaFormData, SiswaRow, StudentQuota, TabType, UnitOption } from '@/features/data-master/types/siswa'
import shared from '@/styles/page.module.css'
import styles from './page.module.css'

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 1,
}

function getQuotaMessage(quota: StudentQuota) {
  if (!quota) return null
  if (quota.warningLevel === 'FULL') {
    return {
      title: 'Kuota siswa aktif sudah penuh',
      description: `Saat ini ${quota.activeStudents}/${quota.studentCapacity} slot terpakai. Penambahan siswa aktif baru akan ditolak sampai ada slot tersedia atau paket di-upgrade.`,
      tone: 'full' as const,
    }
  }
  if (quota.warningLevel === 'WARNING_90') {
    return {
      title: 'Kuota siswa aktif hampir penuh',
      description: `Tersisa ${quota.remainingSlots} slot. Segera siapkan upgrade paket agar operasional input siswa tidak terhambat.`,
      tone: 'warning' as const,
    }
  }
  if (quota.warningLevel === 'WARNING_80') {
    return {
      title: 'Penggunaan kuota sudah melewati 80%',
      description: `Masih tersedia ${quota.remainingSlots} slot, tetapi tenant sebaiknya mulai menyiapkan upgrade paket berikutnya.`,
      tone: 'warning' as const,
    }
  }
  return null
}

export default function SiswaPage() {
  const [data, setData] = useState<SiswaRow[]>([])
  const [studentQuota, setStudentQuota] = useState<StudentQuota>(null)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [units, setUnits] = useState<UnitOption[]>([])
  const [kelases, setKelases] = useState<KelasOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profil')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null)

  const [formData, setFormData] = useState<SiswaFormData>({
    nis: '', nisn: '', namaLengkap: '', jenisKelamin: 'LAKI_LAKI',
    tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '',
    fotoUrl: '', namaWali: '', teleponWali: '', emailWali: '',
    kelasId: '', unitId: '', status: 'AKTIF',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
      })
      if (searchQuery) params.set('search', searchQuery)
      const url = `/api/data-master/siswa?${params.toString()}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.data) setData(json.data)
      setStudentQuota(json.meta?.studentQuota || null)
      setPagination(json.meta?.pagination || initialPagination)
      if (json.meta?.pagination?.page && json.meta.pagination.page !== page) {
        setPage(json.meta.pagination.page)
      }
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }, [page, pagination.pageSize, searchQuery])

  const fetchDependencies = useCallback(async () => {
    try {
      const [resUnits, resKelases] = await Promise.all([fetch('/api/data-master/unit'), fetch('/api/data-master/kelas')])
      const [jsonUnits, jsonKelases] = await Promise.all([resUnits.json(), resKelases.json()])
      if (jsonUnits.data) setUnits(jsonUnits.data)
      if (jsonKelases.data) setKelases(jsonKelases.data)
    } catch { console.error('Error fetching dependencies') }
  }, [])

  useEffect(() => { fetchDependencies() }, [fetchDependencies])
  useEffect(() => { const t = setTimeout(fetchData, 300); return () => clearTimeout(t) }, [fetchData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const emptyForm: SiswaFormData = { nis: '', nisn: '', namaLengkap: '', jenisKelamin: 'LAKI_LAKI', tempatLahir: '', tanggalLahir: '', alamat: '', telepon: '', fotoUrl: '', namaWali: '', teleponWali: '', emailWali: '', kelasId: '', unitId: '', status: 'AKTIF' }

  const openAddModal = () => {
    setEditId(null); setFormData(emptyForm); setActiveTab('profil'); setErrorMsg(''); setIsModalOpen(true)
  }

  const openEditModal = (row: SiswaRow) => {
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

  const columns: Column<SiswaRow>[] = [
    {
      header: 'Bio Siswa',
      accessor: (row) => (
        <div className={shared.userCell}>
          <div className={shared.avatar}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <span style={{ fontWeight: 500, fontSize: 'var(--sp-text-sm)' }}>{row.kelas?.nama || '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building2 size={12} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)' }}>{row.unit?.nama || '-'}</span>
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

  const quotaNotice = getQuotaMessage(studentQuota)
  const shouldBlockNewActive = !editId && formData.status === 'AKTIF' && studentQuota?.warningLevel === 'FULL'

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Data Siswa</h1>
          <p className={shared.subtitle}>Kelola profil, akademik, dan status siswa</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAddModal}>Tambah Siswa</Button>
      </div>
      {quotaNotice ? (
        <section className={styles.noticeCard} data-tone={quotaNotice.tone}>
          <div>
            <h3 className={styles.noticeTitle}>{quotaNotice.title}</h3>
            <p className={styles.noticeDesc}>{quotaNotice.description}</p>
          </div>
          <div className={styles.noticeMeta}>
            <strong>{studentQuota?.activeStudents || 0}/{studentQuota?.studentCapacity || 0}</strong>
            <span>siswa aktif</span>
          </div>
        </section>
      ) : null}
      <div className={shared.toolbar}>
        <SearchInput
          placeholder="Cari NIS atau nama..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Data siswa belum tersedia" />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={setPage}
      />

      <SiswaFormModal
        editId={editId}
        formData={formData}
        units={units}
        kelases={kelases}
        activeTab={activeTab}
        errorMsg={errorMsg}
        quotaWarning={!editId && formData.status === 'AKTIF' && quotaNotice ? `${quotaNotice.title}. ${quotaNotice.description}` : null}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        shouldBlockNewActive={shouldBlockNewActive}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onTabChange={setActiveTab}
        onInputChange={handleInputChange}
      />

      <SiswaDeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
