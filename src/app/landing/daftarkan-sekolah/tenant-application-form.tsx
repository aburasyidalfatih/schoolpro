'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import styles from './page.module.css'

const jenjangOptions = ['TK', 'SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA', 'PESANTREN', 'LAINNYA']
const statusOptions = ['NEGERI', 'SWASTA', 'PESANTREN', 'YAYASAN', 'LAINNYA']
const sourceOptions = ['Website SchoolPro', 'WhatsApp', 'Instagram', 'Facebook', 'Referensi', 'Presentasi', 'Lainnya']

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
        setError(json.error || 'Gagal mengirim aplikasi tenant.')
        return
      }

      setSubmitState({
        applicationCode: json.data.applicationCode,
      })
      form.reset()
    } catch {
      setError('Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitState) {
    return (
      <section className={styles.successPanel}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={28} />
        </div>
        <span className={styles.successBadge}>Formulir berhasil dikirim</span>
        <h2>Terima kasih, sekolah Anda sudah masuk ke tahap review awal</h2>
        <p>
          Simpan nomor referensi ini untuk komunikasi berikutnya: <strong>{submitState.applicationCode}</strong>.
          Tim SchoolPro akan meninjau data sekolah Anda dan menghubungi PIC yang Anda cantumkan.
        </p>
        <div className={styles.successCallout}>
          Jika ada informasi yang perlu dikonfirmasi, kami akan menghubungi sekolah melalui email atau WhatsApp PIC.
          Setelah itu, kami bantu arahkan ke tahap onboarding yang paling sesuai.
        </div>
        <button type="button" className={styles.secondaryButton} onClick={() => setSubmitState(null)}>
          Isi formulir baru
        </button>
      </section>
    )
  }

  return (
    <form className={styles.registrationForm} onSubmit={handleSubmit}>
      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>1</div>
          <div>
            <h2>Profil sekolah</h2>
            <p>Ceritakan identitas sekolah Anda agar kami bisa memahami konteks dan skala kebutuhan.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="namaSekolah">
              Nama sekolah <span className={styles.required}>*</span>
            </label>
            <input id="namaSekolah" name="namaSekolah" placeholder="SMA Islam Contoh" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jenjang">
              Jenjang <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select id="jenjang" name="jenjang" defaultValue="" required>
                <option value="" disabled>
                  Pilih jenjang
                </option>
                {jenjangOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
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
                <option value="" disabled>
                  Pilih status
                </option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className={styles.selectIcon}>⌄</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="npsn">
              NPSN <span className={styles.optional}>Opsional</span>
            </label>
            <input id="npsn" name="npsn" placeholder="20200000" inputMode="numeric" />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailSekolah">
              Email sekolah <span className={styles.required}>*</span>
            </label>
            <input id="emailSekolah" name="emailSekolah" type="email" placeholder="info@sekolah.sch.id" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="teleponSekolah">
              Telepon sekolah <span className={styles.required}>*</span>
            </label>
            <input id="teleponSekolah" name="teleponSekolah" placeholder="021xxxxxxx" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="provinsi">
              Provinsi <span className={styles.required}>*</span>
            </label>
            <input id="provinsi" name="provinsi" placeholder="Jawa Barat" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="kotaKabupaten">
              Kota / kabupaten <span className={styles.required}>*</span>
            </label>
            <input id="kotaKabupaten" name="kotaKabupaten" placeholder="Bandung" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="websiteSaatIni">
              Website saat ini <span className={styles.optional}>Opsional</span>
            </label>
            <input id="websiteSaatIni" name="websiteSaatIni" placeholder="https://www.sekolah.sch.id" />
            <span className={styles.formHint}>Jika sudah ada, isi alamat website sekolah</span>
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
              placeholder="540"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="alamat">
              Alamat sekolah <span className={styles.required}>*</span>
            </label>
            <textarea id="alamat" name="alamat" rows={3} placeholder="Tuliskan alamat lengkap sekolah" required />
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>2</div>
          <div>
            <h2>Kontak penanggung jawab</h2>
            <p>Isi kontak orang yang paling tepat untuk dihubungi saat kami menindaklanjuti pendaftaran ini.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="namaPic">
              Nama PIC <span className={styles.required}>*</span>
            </label>
            <input id="namaPic" name="namaPic" placeholder="Nama penanggung jawab" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jabatanPic">
              Jabatan PIC <span className={styles.required}>*</span>
            </label>
            <input id="jabatanPic" name="jabatanPic" placeholder="Kepala Sekolah / TU / Operator" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emailPic">
              Email PIC <span className={styles.required}>*</span>
            </label>
            <input id="emailPic" name="emailPic" type="email" placeholder="pic@sekolah.sch.id" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="whatsappPic">
              WhatsApp PIC <span className={styles.required}>*</span>
            </label>
            <input id="whatsappPic" name="whatsappPic" placeholder="08xxxxxxxxxx" required />
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionNumber}>3</div>
          <div>
            <h2>Kebutuhan sekolah</h2>
            <p>Bagian ini membantu kami memahami kebutuhan awal yang paling relevan untuk sekolah Anda.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="slugRequest">
              Nama singkat sekolah untuk alamat SchoolPro <span className={styles.required}>*</span>
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
              Contoh: <code>sman1-bandung.schoolpro.id</code>. Ini membantu kami menyiapkan alamat awal sekolah Anda di
              SchoolPro.
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sumberLead">
              Sumber lead <span className={styles.optional}>Opsional</span>
            </label>
            <div className={styles.selectWrapper}>
              <select id="sumberLead" name="sumberLead" defaultValue="">
                <option value="">Pilih sumber lead</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className={styles.selectIcon}>⌄</span>
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label htmlFor="kebutuhanUtama">
              Kebutuhan utama <span className={styles.required}>*</span>
            </label>
            <textarea
              id="kebutuhanUtama"
              name="kebutuhanUtama"
              rows={4}
              placeholder="Contoh: kami ingin mulai dari website sekolah yang mudah dikelola, lalu lanjut ke PPDB online."
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
              placeholder="Target waktu launching, kebutuhan pelatihan, atau catatan lain yang ingin disampaikan."
            />
          </div>
        </div>
      </section>

      <div className={styles.formFooter}>
        <p className={styles.disclaimer}>
          Dengan mengirim formulir ini, sekolah Anda masuk ke tahap konsultasi dan peninjauan awal bersama tim
          SchoolPro. Kami akan menindaklanjuti melalui kontak yang Anda isi di atas.
        </p>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              Mengirim formulir...
            </>
          ) : (
            'Kirim pendaftaran sekolah'
          )}
        </button>
      </div>
    </form>
  )
}
