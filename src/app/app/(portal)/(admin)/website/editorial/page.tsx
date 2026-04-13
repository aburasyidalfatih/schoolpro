'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Editorial = { id: string; judul: string; penulis: string | null; judulPenulis: string | null; isPublished: boolean; tanggal: string; gambarUrl: string | null }
type EditorialEditorRow = Editorial & {
  konten?: string | null
  ringkasan?: string | null
  fotoPenulis?: string | null
}
const empty = { judul: '', konten: '', ringkasan: '', penulis: '', fotoPenulis: '', judulPenulis: '', gambarUrl: '', isPublished: true, tanggal: new Date().toISOString().slice(0, 10) }

export default function EditorialPage() {
  const [data, setData] = useState<Editorial[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Editorial | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/website/editorial')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: EditorialEditorRow) => {
    setEditing(row)
    setForm({ judul: row.judul, konten: row.konten || '', ringkasan: row.ringkasan || '', penulis: row.penulis || '', fotoPenulis: row.fotoPenulis || '', judulPenulis: row.judulPenulis || '', gambarUrl: row.gambarUrl || '', isPublished: row.isPublished, tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : empty.tanggal })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.judul) { toast.error('Judul wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/editorial/${editing.id}` : '/api/website/editorial', {
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
      await fetch(`/api/website/editorial/${deleteId}`, { method: 'DELETE' })
      toast.success('Editorial dihapus'); setDeleteId(null); fetchData()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Editorial>[] = [
    { header: 'Judul', accessor: (r) => <div><div className="font-medium">{r.judul}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{r.judulPenulis} — {r.penulis}</div></div> },
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
          <h1 className={shared.title}>Editorial</h1>
          <p className={shared.subtitle}>Kelola editorial kepala sekolah</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada editorial" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Editorial' : 'Tambah Editorial'} maxWidth="640px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Judul *" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} />
          <Textarea label="Ringkasan" value={form.ringkasan} onChange={e => setForm(p => ({ ...p, ringkasan: e.target.value }))} />
          <Textarea label="Konten" value={form.konten} onChange={e => setForm(p => ({ ...p, konten: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nama Penulis" value={form.penulis} onChange={e => setForm(p => ({ ...p, penulis: e.target.value }))} />
            <Input label="Jabatan Penulis" value={form.judulPenulis} onChange={e => setForm(p => ({ ...p, judulPenulis: e.target.value }))} hint="Contoh: Kepala Sekolah" />
            <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))} />
          </div>
          <ImageUpload label="Foto Penulis" value={form.fotoPenulis} onChange={url => setForm(p => ({ ...p, fotoPenulis: url }))} />
          <ImageUpload label="Gambar Artikel" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
            <label htmlFor="isPublished" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Terbitkan</label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Editorial" maxWidth="400px"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus editorial ini?</p>
      </Modal>
    </div>
  )
}
