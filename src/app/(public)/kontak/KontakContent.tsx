'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

interface ContactSchoolInfo {
  address?: string
  phone?: string
  email?: string
  mapEmbed?: string
}

export default function KontakContent({ schoolInfo }: { schoolInfo: ContactSchoolInfo }) {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const newErrors: Record<string, string> = {}
    if (!data.get('nama')) newErrors.nama = 'Nama wajib diisi'
    if (!data.get('email')) newErrors.email = 'Email wajib diisi'
    if (!data.get('pesan')) newErrors.pesan = 'Pesan wajib diisi'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    setSubmitted(true)
  }

  const contacts = [
    schoolInfo.address && { icon: <MapPin className="h-5 w-5" />, label: 'Alamat', value: schoolInfo.address },
    schoolInfo.phone && { icon: <Phone className="h-5 w-5" />, label: 'Telepon', value: schoolInfo.phone },
    schoolInfo.email && { icon: <Mail className="h-5 w-5" />, label: 'Email', value: schoolInfo.email },
    { icon: <Clock className="h-5 w-5" />, label: 'Jam Operasional', value: 'Senin - Sabtu: 07:00 - 16:00 WIB' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[]

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
      {/* Info */}
      <div className="min-w-0">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--skin-text-heading)' }}>Informasi Kontak</h2>
        <div className="space-y-4 mb-8">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'var(--skin-surface)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--skin-text-muted)' }}>{c.label}</p>
                <p className="text-sm font-semibold break-words" style={{ color: 'var(--skin-text-heading)' }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl overflow-hidden h-64 shadow-inner" style={{ background: 'var(--skin-surface)' }}>
          {schoolInfo.mapEmbed ? (
            <iframe src={schoolInfo.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Lokasi Sekolah" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--skin-text-muted)' }}>
              <MapPin className="h-8 w-8 mr-2" /><span>Peta belum dikonfigurasi</span>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="min-w-0">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--skin-text-heading)' }}>Kirim Pesan</h2>
        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl" style={{ background: 'var(--skin-surface)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white"
              style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--skin-text-heading)' }}>Pesan Terkirim!</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--skin-text-muted)' }}>Terima kasih. Kami akan segera merespons pesan Anda.</p>
            <button onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:shadow-lg"
              style={{ borderColor: 'var(--skin-primary)', color: 'var(--skin-primary)' }}>
              Kirim Pesan Lagi
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {[
              { id: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan nama lengkap', required: true },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'contoh@email.com', required: true },
              { id: 'telepon', label: 'No. Telepon', type: 'tel', placeholder: '08xx-xxxx-xxxx', required: false },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium mb-2" style={{ color: 'var(--skin-text-body)' }}>
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input id={f.id} name={f.id} type={f.type} placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:outline-none"
                  style={{ borderColor: errors[f.id] ? '#ef4444' : 'var(--skin-border)', background: 'var(--skin-surface)' }}
                  onChange={() => errors[f.id] && setErrors({ ...errors, [f.id]: '' })} />
                {errors[f.id] && <p className="text-xs text-red-500 mt-1">{errors[f.id]}</p>}
              </div>
            ))}
            <div>
              <label htmlFor="pesan" className="block text-sm font-medium mb-2" style={{ color: 'var(--skin-text-body)' }}>
                Pesan <span className="text-red-500">*</span>
              </label>
              <textarea id="pesan" name="pesan" rows={5} placeholder="Tulis pesan Anda..."
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:ring-2 focus:outline-none resize-none"
                style={{ borderColor: errors.pesan ? '#ef4444' : 'var(--skin-border)', background: 'var(--skin-surface)' }}
                onChange={() => errors.pesan && setErrors({ ...errors, pesan: '' })} />
              {errors.pesan && <p className="text-xs text-red-500 mt-1">{errors.pesan}</p>}
            </div>
            <button type="submit"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--skin-primary), var(--skin-primary-light))' }}>
              <Send className="h-4 w-4" /> Kirim Pesan
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
