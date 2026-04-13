'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'
import { formatDate } from '@/lib/utils'

type Agenda = { id: string; judul: string; deskripsi: string | null; tanggalMulai: string; tanggalAkhir: string | null; lokasi: string | null; penanggungjawab: string | null; isPublished: boolean; gambarUrl?: string | null }
const empty = { judul: '', deskripsi: '', tanggalMulai: '', tanggalAkhir: '', lokasi: '', penanggungjawab: '', gambarUrl: '', isPublished: true }

export default function AgendaPage() {
  const [data, setData] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Agenda | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/website/agenda')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const toDateInput = (d: string | null) => d ? new Date(d).toISOString().slice(0, 10) : ''
  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Agenda) => {
    setEditing(row)
    setForm({ judul: row.judul, deskripsi: row.deskripsi || '', tanggalMulai: toDateInput(row.tanggalMulai), tanggalAkhir: toDateInput(row.tanggalAkhir), lokasi: row.lokasi || '', penanggungjawab: row.penanggungjawab || '', gambarUrl: row.gambarUrl || '', isPublished: row.isPublished })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.judul || !form.tanggalMulai) { toast.error('Judul dan tanggal wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/agenda/${editing.id}` : '/api/website/agenda', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Gagal'); return }
      toast.success('Berhasil disimpan'); setModal(false); fetch_()
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/website/agenda/${deleteId}`, { method: 'DELETE' })
      toast.success('Agenda dihapus'); setDeleteId(null); fetch_()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Agenda>[] = [
    { header: 'Judul', accessor: 'judul' },
    { header: 'Tanggal', accessor: (r) => formatDate(r.tanggalMulai), width: '130px' },
    { header: 'Lokasi', accessor: (r) => r.lokasi || '-' },
    { header: 'Status', accessor: (r) => <Badge variant={r.isPublished ? 'success' : 'gray'}>{r.isPublished ? 'Publik' : 'Draft'}</Badge>, align: 'center', width: '90px' },
    { header: 'Aksi', align: 'center', width: '100px', accessor: (r) => (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
        <Button size="icon" variant="danger" onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></Button>
      </div>
    )},
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div><h1 className={shared.title}>Agenda</h1><p className={shared.subtitle}>Kelola agenda kegiatan sekolah</p></div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah Agenda</Button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada agenda" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Agenda' : 'Tambah Agenda'} maxWidth="560px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Judul *" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Tanggal Mulai *" type="date" value={form.tanggalMulai} onChange={e => setForm(p => ({ ...p, tanggalMulai: e.target.value }))} required />
            <Input label="Tanggal Akhir" type="date" value={form.tanggalAkhir} onChange={e => setForm(p => ({ ...p, tanggalAkhir: e.target.value }))} />
          </div>
          <Input label="Lokasi" value={form.lokasi} onChange={e => setForm(p => ({ ...p, lokasi: e.target.value }))} />
          <Input label="Penanggung Jawab" value={form.penanggungjawab} onChange={e => setForm(p => ({ ...p, penanggungjawab: e.target.value }))} />
          <Textarea label="Deskripsi" value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} />
          <ImageUpload label="Gambar Banner (Opsional)" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Agenda"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus agenda ini?</p>
      </Modal>
    </div>
  )
}
