'use client'

import { GraduationCap, Home, User, Users } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { KelasOption, SiswaFormData, TabType, UnitOption } from '@/features/data-master/types/siswa'
import shared from '@/styles/page.module.css'

const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'profil', label: 'Profil', icon: <User size={15} /> },
  { key: 'kontak', label: 'Kontak', icon: <Home size={15} /> },
  { key: 'orangtua', label: 'Wali', icon: <Users size={15} /> },
  { key: 'akademik', label: 'Akademik', icon: <GraduationCap size={15} /> },
]

type SiswaFormModalProps = {
  editId: string | null
  formData: SiswaFormData
  units: UnitOption[]
  kelases: KelasOption[]
  activeTab: TabType
  errorMsg: string
  quotaWarning: string | null
  isOpen: boolean
  isSubmitting: boolean
  shouldBlockNewActive: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onTabChange: (tab: TabType) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export function SiswaFormModal({
  editId,
  formData,
  units,
  kelases,
  activeTab,
  errorMsg,
  quotaWarning,
  isOpen,
  isSubmitting,
  shouldBlockNewActive,
  onClose,
  onSubmit,
  onTabChange,
  onInputChange,
}: SiswaFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title={editId ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'} maxWidth="580px">
      <div className={shared.modalTabs}>
        {tabs.map((tab) => (
          <button key={tab.key} className={cn(shared.tabBtn, activeTab === tab.key && shared.tabActive)} onClick={() => onTabChange(tab.key)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      <form className={shared.form} onSubmit={onSubmit}>
        {errorMsg && <div className={shared.errorAlert}>{errorMsg}</div>}
        {!editId && formData.status === 'AKTIF' && quotaWarning ? (
          <div className={shared.errorAlert}>{quotaWarning}</div>
        ) : null}

        {activeTab === 'profil' && (
          <div className={shared.tabContent}>
            <div className={shared.formRow}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>NIS <span className="required">*</span></label>
                <input required name="nis" value={formData.nis} onChange={onInputChange} className={shared.formInput} placeholder="Nomor Induk Siswa" />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>NISN</label>
                <input name="nisn" value={formData.nisn} onChange={onInputChange} className={shared.formInput} placeholder="Nomor Induk Nasional" />
              </div>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Nama Lengkap <span className="required">*</span></label>
              <input required name="namaLengkap" value={formData.namaLengkap} onChange={onInputChange} className={shared.formInput} placeholder="Nama sesuai identitas" />
            </div>
            <div className={shared.formRow}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Jenis Kelamin</label>
                <select name="jenisKelamin" value={formData.jenisKelamin} onChange={onInputChange} className={shared.formInput}>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Tempat Lahir</label>
                <input name="tempatLahir" value={formData.tempatLahir} onChange={onInputChange} className={shared.formInput} placeholder="Nama Kota" />
              </div>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Tanggal Lahir</label>
              <input name="tanggalLahir" value={formData.tanggalLahir} onChange={onInputChange} type="date" className={shared.formInput} />
            </div>
          </div>
        )}

        {activeTab === 'kontak' && (
          <div className={shared.tabContent}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Alamat Lengkap</label>
              <textarea name="alamat" value={formData.alamat} onChange={onInputChange} className={shared.formInput} rows={4} placeholder="Alamat tinggal saat ini" style={{ resize: 'vertical' }} />
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Nomor Telepon</label>
              <input name="telepon" value={formData.telepon} onChange={onInputChange} className={shared.formInput} placeholder="08xxxx" />
            </div>
          </div>
        )}

        {activeTab === 'orangtua' && (
          <div className={shared.tabContent}>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Nama Wali / Orang Tua</label>
              <input name="namaWali" value={formData.namaWali} onChange={onInputChange} className={shared.formInput} placeholder="Nama Lengkap" />
            </div>
            <div className={shared.formRow}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Telepon Wali</label>
                <input name="teleponWali" value={formData.teleponWali} onChange={onInputChange} className={shared.formInput} placeholder="08xxxx" />
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Email Wali</label>
                <input name="emailWali" value={formData.emailWali} onChange={onInputChange} type="email" className={shared.formInput} placeholder="email@example.com" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'akademik' && (
          <div className={shared.tabContent}>
            <div className={shared.formRow}>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Unit / Jenjang</label>
                <select name="unitId" value={formData.unitId} onChange={onInputChange} className={shared.formInput}>
                  <option value="">Pilih Unit</option>
                  {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.nama}</option>)}
                </select>
              </div>
              <div className={shared.formGroup}>
                <label className={shared.formLabel}>Kelas</label>
                <select name="kelasId" value={formData.kelasId} onChange={onInputChange} className={shared.formInput}>
                  <option value="">Pilih Kelas</option>
                  {kelases.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>)}
                </select>
              </div>
            </div>
            <div className={shared.formGroup}>
              <label className={shared.formLabel}>Status Siswa</label>
              <select name="status" value={formData.status} onChange={onInputChange} className={shared.formInput}>
                <option value="AKTIF">Aktif</option>
                <option value="TIDAK_AKTIF">Tidak Aktif</option>
                <option value="LULUS">Lulus</option>
                <option value="PINDAH">Pindah</option>
              </select>
            </div>
          </div>
        )}

        <div className={shared.modalFooter}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>Batal</Button>
          <Button type="submit" isLoading={isSubmitting} disabled={shouldBlockNewActive}>Simpan Data Siswa</Button>
        </div>
      </form>
    </Modal>
  )
}
