'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Select, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Prestasi = { id: string; judul: string; deskripsi: string | null; tingkat: string; kategori: string; tahun: number; gambarUrl: string | null; isPublished: boolean }
const empty = { judul: '', deskripsi: '', tingkat: 'SEKOLAH', kategori: 'AKADEMIK', tahun: new Date().getFullYear(), gambarUrl: '', isPublished: true }

export default function PrestasiPage() {
  const [data, setData] = useState<Prestasi[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Prestasi | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetch_ = async () => {
    setLoading(true)
    const res = await fetch('/api/website/prestasi')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Prestasi) => {
    setEditing(row)
    setForm({ judul: row.judul, deskripsi: row.deskripsi || '', tingkat: row.tingkat, kategori: row.kategori, tahun: row.tahun, gambarUrl: row.gambarUrl || '', isPublished: row.isPublished })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.judul) { toast.error('Judul wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/prestasi/${editing.id}` : '/api/website/prestasi', {
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
      await fetch(`/api/website/prestasi/${deleteId}`, { method: 'DELETE' })
      toast.success('Prestasi dihapus'); setDeleteId(null); fetch_()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Prestasi>[] = [
    {
      header: 'Gambar',
      accessor: (r) => r.gambarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.gambarUrl} alt={r.judul} style={{ height: 40, width: 60, objectFit: 'cover', borderRadius: 6 }} />
      ) : '-',
      width: '80px',
    },
    { header: 'Judul', accessor: 'judul' },
    { header: 'Tingkat', accessor: 'tingkat', width: '110px' },
    { header: 'Tahun', accessor: 'tahun', align: 'center', width: '80px' },
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
        <div><h1 className={shared.title}>Prestasi</h1><p className={shared.subtitle}>Kelola data prestasi sekolah</p></div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah Prestasi</Button>
      </div>
      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada prestasi" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Prestasi' : 'Tambah Prestasi'} maxWidth="560px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Judul Prestasi *" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Tingkat" value={form.tingkat} onChange={e => setForm(p => ({ ...p, tingkat: e.target.value }))}>
              {['SEKOLAH','KECAMATAN','KABUPATEN','PROVINSI','NASIONAL','INTERNASIONAL'].map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
            <Select label="Kategori" value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))}>
              {['AKADEMIK','NON_AKADEMIK','OLAHRAGA','SENI','LAINNYA'].map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
          </div>
          <Input label="Tahun" type="number" value={String(form.tahun)} onChange={e => setForm(p => ({ ...p, tahun: Number(e.target.value) }))} />
          <Textarea label="Deskripsi" value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} />
          <ImageUpload label="Gambar Utama (Thumbnail)" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Prestasi"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus prestasi ini?</p>
      </Modal>
    </div>
  )
}
