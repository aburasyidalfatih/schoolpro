'use client'
import { useRef, useState } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Upload Gambar' }: Props) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/website/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Gagal upload'); return }
      onChange(json.url)
    } catch { toast.error('Gagal upload') } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: 320 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
          <button type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 320, height: 120, border: '2px dashed var(--border-color)', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-tertiary)', gap: 6 }}>
          {uploading ? <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-500)' }} /> : <UploadCloud size={28} style={{ color: 'var(--text-tertiary)' }} />}
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{uploading ? 'Mengupload...' : 'Klik untuk upload'}</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>JPG, PNG, WEBP (maks 5MB)</span>
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  )
}
