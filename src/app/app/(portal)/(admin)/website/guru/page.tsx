'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button, DataTable, Modal, Input, Badge, ImageUpload } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { Column } from '@/components/ui/DataTable'
import shared from '@/styles/page.module.css'

type Guru = {
  id: string; nama: string; jabatanLabel: string; bidang: string | null
  foto: string | null; isActive: boolean; urutan: number
}
const empty = { nama: '', jabatan: 'guru', jabatanLabel: '', nip: '', pendidikan: '', bidang: '', bio: '', quote: '', foto: '', urutan: 0, isActive: true }

export default function GuruPage() {
  const [data, setData] = useState<Guru[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Guru | null>(null)
  const [form, setForm] = useState(empty)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/website/guru')
    const json = await res.json()
    if (json.data) setData(json.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    setForm({ nama: row.nama, jabatan: row.jabatan, jabatanLabel: row.jabatanLabel, nip: row.nip || '', pendidikan: row.pendidikan || '', bidang: row.bidang || '', bio: row.bio || '', quote: row.quote || '', foto: row.foto || '', urutan: row.urutan, isActive: row.isActive })
    setModal(true)
  }

  const handleSubmit = async () => {
    if (!form.nama) { toast.error('Nama wajib diisi'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(editing ? `/api/website/guru/${editing.id}` : '/api/website/guru', {
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
      await fetch(`/api/website/guru/${deleteId}`, { method: 'DELETE' })
      toast.success('Data dihapus'); setDeleteId(null); fetchData()
    } catch { toast.error('Gagal menghapus') }
  }

  const columns: Column<Guru>[] = [
    {
      header: 'Guru / Staff', accessor: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {r.foto ? <img src={r.foto} alt={r.nama} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--primary-600)' }}>{r.nama[0]}</div>}
          <div><div className="font-medium">{r.nama}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{r.bidang}</div></div>
        </div>
      )
    },
    { header: 'Jabatan', accessor: 'jabatanLabel', width: '160px' },
    { header: 'Status', accessor: (r) => <Badge variant={r.isActive ? 'success' : 'gray'}>{r.isActive ? 'Aktif' : 'Nonaktif'}</Badge>, align: 'center', width: '90px' },
    { header: 'Urutan', accessor: 'urutan', align: 'center', width: '80px' },
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
          <h1 className={shared.title}>Guru & Staff</h1>
          <p className={shared.subtitle}>Kelola data guru dan staff sekolah</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openAdd}>Tambah</Button>
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} emptyMessage="Belum ada data guru" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Guru' : 'Tambah Guru'} maxWidth="640px"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={handleSubmit} isLoading={isSubmitting}>Simpan</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nama Lengkap *" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} />
            <Input label="Jabatan Label" value={form.jabatanLabel} onChange={e => setForm(p => ({ ...p, jabatanLabel: e.target.value }))} hint="Contoh: Kepala Sekolah" />
            <Input label="NIP" value={form.nip} onChange={e => setForm(p => ({ ...p, nip: e.target.value }))} />
            <Input label="Bidang Studi" value={form.bidang} onChange={e => setForm(p => ({ ...p, bidang: e.target.value }))} />
            <Input label="Pendidikan" value={form.pendidikan} onChange={e => setForm(p => ({ ...p, pendidikan: e.target.value }))} />
            <Input label="Urutan Tampil" type="number" value={String(form.urutan)} onChange={e => setForm(p => ({ ...p, urutan: Number(e.target.value) }))} />
          </div>
          <Textarea label="Bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          <Textarea label="Quote" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} />
          <ImageUpload label="Foto" value={form.foto} onChange={url => setForm(p => ({ ...p, foto: url }))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
            <label htmlFor="isActive" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Tampilkan di website</label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Data Guru" maxWidth="400px"
        footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Batal</Button><Button variant="danger" onClick={handleDelete}>Hapus</Button></>}>
        <p>Yakin ingin menghapus data guru ini?</p>
      </Modal>
    </div>
  )
}
