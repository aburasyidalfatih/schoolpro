'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Blog = { id: string; judul: string; penulis: string | null; kategori: string | null; isPublished: boolean; tanggal: string; gambarUrl: string | null }
const empty = { judul: '', konten: '', ringkasan: '', penulis: '', fotoPenulis: '', bioPenulis: '', kategori: '', tags: '', gambarUrl: '', isPublished: true, tanggal: new Date().toISOString().slice(0, 10) }

export default function BlogPage() {
  const [data, setData] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Blog | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/website/blog')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    setForm({ judul: row.judul, konten: row.konten || '', ringkasan: row.ringkasan || '', penulis: row.penulis || '', fotoPenulis: row.fotoPenulis || '', bioPenulis: row.bioPenulis || '', kategori: row.kategori || '', tags: row.tags || '', gambarUrl: row.gambarUrl || '', isPublished: row.isPublished, tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : empty.tanggal })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.judul) { toast.error('Judul wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/blog/${editing.id}` : '/api/website/blog', {
        method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Gagal'); return }
      toast.success('Berhasil disimpan'); setModal(false); fetchData()
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/website/blog/${deleteId}`, { method: 'DELETE' })
      toast.success('Blog dihapus'); setDeleteId(null); fetchData()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Blog>[] = [
    { header: 'Judul', accessor: (r) => <div><div className="font-medium">{r.judul}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>oleh {r.penulis || '-'}</div></div> },
    { header: 'Kategori', accessor: (r) => r.kategori || '-', width: '120px' },
    { header: 'Status', accessor: (r) => <Badge variant={r.isPublished ? 'success' : 'gray'}>{r.isPublished ? 'Terbit' : 'Draft'}</Badge>, align: 'center', width: '90px' },
    { header: 'Tanggal', accessor: (r) => new Date(r.tanggal).toLocaleDateString('id-ID'), width: '120px' },
    {
      header: 'Aksi', align: 'center', width: '100px',
      accessor: (r) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={15} /></Button>
          <Button variant="danger" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 size={15} /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Blog Guru</h1>
          <p className={shared.subtitle}>Kelola artikel blog dari guru</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada blog" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Blog' : 'Tambah Blog'} maxWidth="640px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Judul *" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} />
          <Textarea label="Ringkasan" value={form.ringkasan} onChange={e => setForm(p => ({ ...p, ringkasan: e.target.value }))} />
          <Textarea label="Konten" value={form.konten} onChange={e => setForm(p => ({ ...p, konten: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Penulis" value={form.penulis} onChange={e => setForm(p => ({ ...p, penulis: e.target.value }))} />
            <Input label="Kategori" value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} />
            <Input label="Tags" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} hint="Pisahkan dengan koma" />
            <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))} />
          </div>
          <Input label="Bio Penulis" value={form.bioPenulis} onChange={e => setForm(p => ({ ...p, bioPenulis: e.target.value }))} />
          <ImageUpload label="Foto Penulis" value={form.fotoPenulis} onChange={url => setForm(p => ({ ...p, fotoPenulis: url }))} />
          <ImageUpload label="Gambar Artikel" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
            <label htmlFor="isPublished" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Terbitkan</label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Blog" maxWidth="400px"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus blog ini?</p>
      </Modal>
    </div>
  )
}
