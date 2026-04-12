'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Pengumuman = {
  id: string; judul: string; ringkasan: string | null; prioritas: string
  tanggal: string; gambarUrl: string | null
}
const empty = { judul: '', ringkasan: '', konten: '', prioritas: 'normal', gambarUrl: '', tanggal: new Date().toISOString().slice(0, 10) }

export default function PengumumanPage() {
  const [data, setData] = useState<Pengumuman[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Pengumuman | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/website/pengumuman')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: Pengumuman) => {
    setEditing(row)
    setForm({
      judul: row.judul, ringkasan: row.ringkasan || '', konten: '',
      prioritas: row.prioritas, gambarUrl: row.gambarUrl || '',
      tanggal: row.tanggal ? new Date(row.tanggal).toISOString().slice(0, 10) : empty.tanggal,
    })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.judul) { toast.error('Judul wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/pengumuman/${editing.id}` : '/api/website/pengumuman', {
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
      await fetch(`/api/website/pengumuman/${deleteId}`, { method: 'DELETE' })
      toast.success('Pengumuman dihapus'); setDeleteId(null); fetchData()
    } catch { toast.error('Gagal menghapus') }
  }

  const prioritasColor: Record<string, 'danger' | 'warning' | 'gray'> = { tinggi: 'danger', sedang: 'warning', normal: 'gray' }

  const columns: Column<Pengumuman>[] = [
    { header: 'Judul', accessor: (r) => <div><div className="font-medium">{r.judul}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{r.ringkasan}</div></div> },
    { header: 'Prioritas', accessor: (r) => <Badge variant={prioritasColor[r.prioritas] || 'gray'}>{r.prioritas}</Badge>, align: 'center', width: '100px' },
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
          <h1 className={shared.title}>Pengumuman</h1>
          <p className={shared.subtitle}>Kelola pengumuman sekolah</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada pengumuman" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'} maxWidth="600px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Judul *" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} />
          <Input label="Ringkasan" value={form.ringkasan} onChange={e => setForm(p => ({ ...p, ringkasan: e.target.value }))} />
          <Textarea label="Konten" value={form.konten} onChange={e => setForm(p => ({ ...p, konten: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Prioritas</label>
              <select value={form.prioritas} onChange={e => setForm(p => ({ ...p, prioritas: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="normal">Normal</option>
                <option value="sedang">Sedang</option>
                <option value="tinggi">Tinggi</option>
              </select>
            </div>
            <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))} />
          </div>
          <ImageUpload label="Gambar" value={form.gambarUrl} onChange={url => setForm(p => ({ ...p, gambarUrl: url }))} />
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Pengumuman" maxWidth="400px"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus pengumuman ini?</p>
      </Modal>
    </div>
  )
}
