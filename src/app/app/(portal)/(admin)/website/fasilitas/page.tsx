'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Fasilitas = { id: string; nama: string; deskripsi: string | null; gambarUrl: string | null; isPublished: boolean }
const empty = { nama: '', deskripsi: '', gambarUrl: '', isPublished: true }

export default function FasilitasPage() {
  const [data, setData] = useState<Fasilitas[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Fasilitas | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/website/fasilitas')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Fasilitas) => {
    setEditing(row)
    setForm({ nama: row.nama, deskripsi: row.deskripsi || '', gambarUrl: row.gambarUrl || '', isPublished: row.isPublished })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.nama) { toast.error('Nama wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/fasilitas/${editing.id}` : '/api/website/fasilitas', {
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
      await fetch(`/api/website/fasilitas/${deleteId}`, { method: 'DELETE' })
      toast.success('Fasilitas dihapus'); setDeleteId(null); fetch_()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Fasilitas>[] = [
    {
      header: 'Gambar',
      accessor: (r) => r.gambarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.gambarUrl} alt={r.nama} style={{ height: 40, width: 60, objectFit: 'cover', borderRadius: 6 }} />
      ) : '-',
      width: '80px',
    },
    { header: 'Nama', accessor: 'nama' },
    { header: 'Deskripsi', accessor: (r) => r.deskripsi ? r.deskripsi.slice(0, 60) + '...' : '-' },
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
        <div><h1 className={shared.title}>Fasilitas</h1><p className={shared.subtitle}>Kelola data fasilitas sekolah</p></div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah Fasilitas</Button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada fasilitas" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Fasilitas' : 'Tambah Fasilitas'} maxWidth="560px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nama Fasilitas *" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required />
          <Textarea label="Deskripsi" value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} />
          <ImageUpload label="Gambar Utama" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Fasilitas"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus fasilitas ini?</p>
      </Modal>
    </div>
  )
}
