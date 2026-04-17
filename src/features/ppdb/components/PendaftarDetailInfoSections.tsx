'use client'

import { ExternalLink, FileText, User, Users } from 'lucide-react'

type PpdbBerkas = {
  id: string
  status: string
  catatan?: string | null
  fileUrl?: string | null
  persyaratan: {
    nama: string
  }
}

type PpdbFormulir = {
  nisn?: string
  jenisKelamin?: string
  tempatLahir?: string
  tanggalLahir?: string
  telepon?: string
  alamat?: string
}

type PpdbOrangtua = {
  namaAyah?: string
  pekerjaanAyah?: string
  namaIbu?: string
  pekerjaanIbu?: string
  email?: string
  penghasilan?: string
}

type PendaftarDetailInfoSectionsProps = {
  namaLengkap: string
  formulir: PpdbFormulir
  orangtua: PpdbOrangtua
  berkas: PpdbBerkas[]
  berkasUpdates: Record<string, { status: string; catatan: string }>
  onBerkasUpdate: (berkasId: string, patch: { status?: string; catatan?: string }) => void
}

export function PendaftarDetailInfoSections({
  namaLengkap,
  formulir,
  orangtua,
  berkas,
  berkasUpdates,
  onBerkasUpdate,
}: PendaftarDetailInfoSectionsProps) {
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} /> Data Calon Siswa</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {[
            { label: 'Nama Lengkap', value: namaLengkap },
            { label: 'NISN', value: formulir.nisn || '—' },
            { label: 'Jenis Kelamin', value: formulir.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : formulir.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '—' },
            { label: 'Tempat Lahir', value: formulir.tempatLahir || '—' },
            { label: 'Tanggal Lahir', value: formulir.tanggalLahir ? new Date(formulir.tanggalLahir).toLocaleDateString('id-ID') : '—' },
            { label: 'Telepon', value: formulir.telepon || '—' },
          ].map((field) => (
            <div key={field.label}>
              <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{field.label}</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{field.value}</div>
            </div>
          ))}
          {formulir.alamat && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Alamat</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{formulir.alamat}</div>
            </div>
          )}
        </div>
      </div>

      {Object.keys(orangtua).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Data Orang Tua</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {[
              { label: 'Nama Ayah', value: orangtua.namaAyah || '—' },
              { label: 'Pekerjaan Ayah', value: orangtua.pekerjaanAyah || '—' },
              { label: 'Nama Ibu', value: orangtua.namaIbu || '—' },
              { label: 'Pekerjaan Ibu', value: orangtua.pekerjaanIbu || '—' },
              { label: 'Email', value: orangtua.email || '—' },
              { label: 'Penghasilan', value: orangtua.penghasilan || '—' },
            ].map((field) => (
              <div key={field.label}>
                <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{field.label}</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {berkas.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} /> Berkas Persyaratan</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {berkas.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--sp-radius-lg)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--sp-text-sm)' }}>{item.persyaratan.nama}</div>
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      Lihat File <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 200 }}>
                  <select
                    className="form-input"
                    style={{ fontSize: 'var(--sp-text-xs)', padding: '0.375rem 0.75rem' }}
                    value={berkasUpdates[item.id]?.status || item.status}
                    onChange={(e) => onBerkasUpdate(item.id, { status: e.target.value })}
                  >
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                  {berkasUpdates[item.id]?.status === 'DITOLAK' && (
                    <input
                      className="form-input"
                      style={{ fontSize: 'var(--sp-text-xs)', padding: '0.375rem 0.75rem' }}
                      placeholder="Alasan penolakan..."
                      value={berkasUpdates[item.id]?.catatan || ''}
                      onChange={(e) => onBerkasUpdate(item.id, { catatan: e.target.value })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
