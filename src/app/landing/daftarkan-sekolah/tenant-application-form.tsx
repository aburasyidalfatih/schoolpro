'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight, Mail, Phone, Globe, MessageCircle } from 'lucide-react'
import styles from './page.module.css'

const jenjangOptions = ['TK', 'SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA', 'Pesantren', 'Lainnya']
const statusOptions = ['Negeri', 'Swasta', 'Pesantren', 'Yayasan', 'Lainnya']
const sourceOptions = ['Website SchoolPro', 'WhatsApp', 'Instagram', 'Facebook', 'Referensi Rekan', 'Presentasi / Event', 'Lainnya']

type SubmitState = {
  applicationCode: string
} | null

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
}

export function TenantApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    if (typeof payload.slugRequest === 'string') {
      payload.slugRequest = normalizeSlug(payload.slugRequest)
    }

    try {
      const response = await fetch('/api/tenant-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Gagal mengirim formulir. Silakan coba lagi.')
        return
      }

      setSubmitState({
        applicationCode: json.data.applicationCode,
      })
      form.reset()
    } catch {
      setError('Terjadi kesalahan jaringan. Periksa koneksi internet Anda dan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitState) {
    return (
      <section className={styles.successPanel}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={32} />
        </div>
        <span className={styles.successBadge}>✓ Pendaftaran Berhasil Dikirim</span>
        <h2>Sekolah Anda sedang dalam antrean review</h2>
        <p>
          Catat nomor referensi Anda:{' '}
          <strong className={styles.refCode}>{submitState.applicationCode}</strong>
          <br />
          Gunakan nomor ini jika ada yang perlu dikonfirmasi bersama tim kami.
        </p>

        <div className={styles.nextSteps}>
          <p className={styles.nextStepsTitle}>Apa yang terjadi selanjutnya?</p>
          <ol className={styles.nextStepsList}>
            <li>
              <span className={styles.stepNum}>1</span>
              <div>
                <strong>Tim kami meninjau data sekolah Anda</strong>
                <span>Biasanya selesai dalam 1–2 hari kerja.</span>
              </div>
            </li>
            <li>
              <span className={styles.stepNum}>2</span>
              <div>
                <strong>Kami menghubungi PIC via WhatsApp atau email</strong>
                <span>Untuk konfirmasi dan diskusi kebutuhan lebih lanjut.</span>
              </div>
            </li>
            <li>
              <span className={styles.stepNum}>3</span>
              <div>
                <strong>Proses onboarding dimulai</strong>
                <span>Kami bantu setup platform sesuai kebutuhan sekolah Anda.</span>
              </div>
            </li>
          </ol>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={() => setSubmitState(null)}>
          Daftarkan Sekolah Lain
        </button>
      </section>
    )
  }

  return (
    <form className={styles.registrationForm} onSubmit={handleSubmit}>
      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      {/* Section 1: Data Sekolah */}
      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>1</div>
          <div>
            <h2>Data Sekolah</h2>
            <p>Informasi dasar yang membantu kami memahami profil dan skala sekolah Anda.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="namaSekolah">
              Nama sekolah <span className={styles.required}>*</span>
            </label>
            <input id="namaSekolah" name="namaSekolah" placeholder="Contoh: SMA Islam Al-Azhar Bandung" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jenjang">
              Jenjang <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select id="jenjang" name="jenjang" defaultValue="" required>
                <option value="" disabled>Pilih jenjang pendidikan</option>
                {jenjangOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className={styles.selectIcon}>⌄</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="statusSekolah">
              Status sekolah <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select id="statusSekolah" name="statusSekolah" defaultValue="" required>
                <option value="" disabled>Pilih status sekolah</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className={styles.selectIcon}>⌄</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="npsn">
              NPSN <span className={styles.optional}>Opsional</span>
            </label>
            <input id="npsn" name="npsn" placeholder="Contoh: 20200001" inputMode="numeric" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jumlahSiswaSaatIni">
              Estimasi jumlah siswa <span className={styles.optional}>Opsional</span>
            </label>
            <input
              id="jumlahSiswaSaatIni"
              name="jumlahSiswaSaatIni"
              type="number"
              min="0"
              placeholder="Contoh: 350"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailSekolah">
              Email sekolah <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIconWrapper}>
              <span className={styles.inputIconPrefix}><Mail size={16} /></span>
              <input id="emailSekolah" name="emailSekolah" type="email" placeholder="info@sekolah.sch.id" required className={styles.inputWithIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="teleponSekolah">
              Telepon sekolah <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIconWrapper}>
              <span className={styles.inputIconPrefix}><Phone size={16} /></span>
              <input id="teleponSekolah" name="teleponSekolah" placeholder="021-xxxxxxx" required className={styles.inputWithIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="provinsi">
              Provinsi <span className={styles.required}>*</span>
            </label>
            <input id="provinsi" name="provinsi" placeholder="Contoh: Jawa Barat" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="kotaKabupaten">
              Kota / Kabupaten <span className={styles.required}>*</span>
            </label>
            <input id="kotaKabupaten" name="kotaKabupaten" placeholder="Contoh: Kota Bandung" required />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="websiteSaatIni">
              Website sekolah saat ini <span className={styles.optional}>Opsional</span>
            </label>
            <div className={styles.inputIconWrapper}>
              <span className={styles.inputIconPrefix}><Globe size={16} /></span>
              <input id="websiteSaatIni" name="websiteSaatIni" placeholder="https://www.sekolah.sch.id" className={styles.inputWithIcon} />
            </div>
            <span className={styles.formHint}>Kosongkan jika sekolah Anda belum memiliki website.</span>
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="alamat">
              Alamat sekolah <span className={styles.required}>*</span>
            </label>
            <textarea id="alamat" name="alamat" rows={3} placeholder="Tuliskan alamat lengkap sekolah termasuk nama jalan, kelurahan, dan kecamatan." required />
          </div>
        </div>
      </section>

      {/* Section 2: Kontak PIC */}
      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>2</div>
          <div>
            <h2>Kontak Penanggung Jawab</h2>
            <p>Siapa yang harus kami hubungi untuk proses onboarding dan tindak lanjut?</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="namaPic">
              Nama lengkap <span className={styles.required}>*</span>
            </label>
            <input id="namaPic" name="namaPic" placeholder="Nama penanggung jawab" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jabatanPic">
              Jabatan <span className={styles.required}>*</span>
            </label>
            <input id="jabatanPic" name="jabatanPic" placeholder="Contoh: Kepala Sekolah / Operator TU" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailPic">
              Email <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIconWrapper}>
              <span className={styles.inputIconPrefix}><Mail size={16} /></span>
              <input id="emailPic" name="emailPic" type="email" placeholder="namapic@sekolah.sch.id" required className={styles.inputWithIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="whatsappPic">
              WhatsApp <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIconWrapper}>
              <span className={styles.inputIconPrefix}><MessageCircle size={16} /></span>
              <input id="whatsappPic" name="whatsappPic" placeholder="08xxxxxxxxxx" required className={styles.inputWithIcon} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Kebutuhan */}
      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>3</div>
          <div>
            <h2>Kebutuhan & Subdomain</h2>
            <p>Ceritakan kebutuhan utama sekolah Anda agar kami bisa menyiapkan solusi yang paling relevan.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="slugRequest">
              Alamat subdomain sekolah <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputSuffixWrapper}>
              <input
                id="slugRequest"
                name="slugRequest"
                placeholder="sman1-bandung"
                required
                onChange={(event) => {
                  event.currentTarget.value = normalizeSlug(event.currentTarget.value)
                }}
              />
              <span className={styles.inputSuffix}>.schoolpro.id</span>
            </div>
            <span className={styles.formHint}>
              Hasilnya: <code>sman1-bandung.schoolpro.id</code>. Subdomain ini bisa diganti setelah proses onboarding selesai.
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sumberLead">
              Dari mana Anda mengetahui SchoolPro? <span className={styles.optional}>Opsional</span>
            </label>
            <div className={styles.selectWrapper}>
              <select id="sumberLead" name="sumberLead" defaultValue="">
                <option value="">Pilih sumber informasi</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className={styles.selectIcon}>⌄</span>
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="kebutuhanUtama">
              Kebutuhan utama sekolah <span className={styles.required}>*</span>
            </label>
            <textarea
              id="kebutuhanUtama"
              name="kebutuhanUtama"
              rows={4}
              placeholder="Contoh: Kami ingin mulai dari website sekolah yang mudah dikelola, kemudian lanjut ke sistem PPDB online untuk penerimaan siswa baru tahun ini."
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="catatanTambahan">
              Catatan tambahan <span className={styles.optional}>Opsional</span>
            </label>
            <textarea
              id="catatanTambahan"
              name="catatanTambahan"
              rows={3}
              placeholder="Contoh: Kami menargetkan website selesai sebelum Juli, atau butuh sesi pelatihan untuk operator sekolah."
            />
          </div>
        </div>
      </section>

      <div className={styles.formFooter}>
        <p className={styles.disclaimer}>
          Dengan mengirim formulir ini, Anda setuju untuk dihubungi oleh tim SchoolPro guna menindaklanjuti pendaftaran ini. Tidak ada biaya yang dikenakan.
        </p>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              Mengirim formulir...
            </>
          ) : (
            <>
              Daftarkan Sekolah Sekarang
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
