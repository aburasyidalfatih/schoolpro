'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Ekskul = { id: string; nama: string; deskripsi: string | null; jadwal: string | null; pembina: string | null; gambarUrl: string | null; isActive: boolean }
const empty = { nama: '', deskripsi: '', jadwal: '', pembina: '', gambarUrl: '', isActive: true }

export default function EkskulPage() {
  const [data, setData] = useState<Ekskul[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Ekskul | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/website/ekskul')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Ekskul) => {
    setEditing(row)
    setForm({ nama: row.nama, deskripsi: row.deskripsi || '', jadwal: row.jadwal || '', pembina: row.pembina || '', gambarUrl: row.gambarUrl || '', isActive: row.isActive })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.nama) { toast.error('Nama wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/ekskul/${editing.id}` : '/api/website/ekskul', {
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
      await fetch(`/api/website/ekskul/${deleteId}`, { method: 'DELETE' })
      toast.success('Ekskul dihapus'); setDeleteId(null); fetch_()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Ekskul>[] = [
    { header: 'Gambar', accessor: (r) => r.gambarUrl ? <img src={r.gambarUrl} alt={r.nama} style={{ height: 40, width: 60, objectFit: 'cover', borderRadius: 6 }} /> : '-', width: '80px' },
    { header: 'Nama', accessor: 'nama' },
    { header: 'Jadwal', accessor: (r) => r.jadwal || '-' },
    { header: 'Pembina', accessor: (r) => r.pembina || '-' },
    { header: 'Status', accessor: (r) => <Badge variant={r.isActive ? 'success' : 'gray'}>{r.isActive ? 'Aktif' : 'Nonaktif'}</Badge>, align: 'center', width: '90px' },
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
        <div><h1 className={shared.title}>Ekstrakurikuler</h1><p className={shared.subtitle}>Kelola data ekskul sekolah</p></div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah Ekskul</Button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada ekskul" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Ekskul' : 'Tambah Ekskul'} maxWidth="560px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nama Ekskul *" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required />
          <Input label="Jadwal" value={form.jadwal} onChange={e => setForm(p => ({ ...p, jadwal: e.target.value }))} placeholder="Contoh: Setiap Jumat, 14:00" />
          <Input label="Pembina" value={form.pembina} onChange={e => setForm(p => ({ ...p, pembina: e.target.value }))} />
          <Textarea label="Deskripsi" value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} />
          <ImageUpload label="Gambar Utama" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Ekskul"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus ekskul ini?</p>
      </Modal>
    </div>
  )
}
