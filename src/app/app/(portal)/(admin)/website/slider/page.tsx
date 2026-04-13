'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Slider = { id: string; judul: string | null; subjudul: string | null; gambarUrl: string; linkUrl: string | null; urutan: number; isActive: boolean }
const empty = { judul: '', subjudul: '', gambarUrl: '', linkUrl: '', urutan: 0, isActive: true }

export default function SliderPage() {
  const [data, setData] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Slider | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/website/slider')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Slider) => {
    setEditing(row)
    setForm({ judul: row.judul || '', subjudul: row.subjudul || '', gambarUrl: row.gambarUrl, linkUrl: row.linkUrl || '', urutan: row.urutan, isActive: row.isActive })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.gambarUrl) { toast.error('Gambar wajib diupload'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/slider/${editing.id}` : '/api/website/slider', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Gagal'); return }
      toast.success(editing ? 'Slider diperbarui' : 'Slider ditambahkan')
      setModal(false); fetch_()
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/website/slider/${deleteId}`, { method: 'DELETE' })
      toast.success('Slider dihapus'); setDeleteId(null); fetch_()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Slider>[] = [
    {
      header: 'Gambar',
      accessor: (r) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.gambarUrl} alt={r.judul || ''} style={{ height: 48, width: 80, objectFit: 'cover', borderRadius: 6 }} />
      ),
      width: '100px',
    },
    { header: 'Judul', accessor: (r) => r.judul || '-' },
    { header: 'Urutan', accessor: 'urutan', align: 'center', width: '80px' },
    { header: 'Status', accessor: (r) => <Badge variant={r.isActive ? 'success' : 'gray'}>{r.isActive ? 'Aktif' : 'Nonaktif'}</Badge>, align: 'center', width: '100px' },
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
        <div><h1 className={shared.title}>Slider / Banner</h1><p className={shared.subtitle}>Kelola banner homepage website</p></div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah Slider</Button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada slider" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Slider' : 'Tambah Slider'} maxWidth="560px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ImageUpload label="Gambar Banner *" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
          <Input label="Judul" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} />
          <Input label="Sub Judul" value={form.subjudul} onChange={e => setForm(p => ({ ...p, subjudul: e.target.value }))} />
          <Input label="Link URL (opsional)" value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..." />
          <Input label="Urutan" type="number" value={String(form.urutan)} onChange={e => setForm(p => ({ ...p, urutan: Number(e.target.value) }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Slider"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus slider ini?</p>
      </Modal>
    </div>
  )
}
