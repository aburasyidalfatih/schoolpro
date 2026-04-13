'use client'

import { FormEvent, useState } from 'react'
import { Loader2 } from 'lucide-react'
import styles from './page.module.css'

const jenjangOptions = ['TK', 'SD', 'SMP', 'SMA', 'SMK', 'MI', 'MTs', 'MA', 'PESANTREN', 'LAINNYA']
const statusOptions = ['NEGERI', 'SWASTA', 'PESANTREN', 'YAYASAN', 'LAINNYA']
const sourceOptions = ['Website SchoolPro', 'WhatsApp', 'Instagram', 'Facebook', 'Referensi', 'Presentasi', 'Lainnya']

type SubmitState = {
  applicationCode: string
} | null

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
      <section className={styles.formCard}>
        <div className={styles.successState}>
          <span className={styles.successBadge}>Formulir berhasil dikirim</span>
          <h2>Terima kasih, sekolah Anda sudah terdaftar di tahap awal</h2>
          <p>
            Simpan nomor referensi ini untuk komunikasi berikutnya: <strong>{submitState.applicationCode}</strong>.
            Tim kami akan meninjau data sekolah Anda dan menghubungi PIC yang Anda cantumkan.
          </p>
          <div className={styles.successCallout}>
            Jika ada informasi yang perlu dikonfirmasi, kami akan menghubungi sekolah melalui email atau WhatsApp PIC.
            Setelah itu, kami bantu arahkan ke tahap onboarding yang paling sesuai.
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => setSubmitState(null)}>
            Isi formulir baru
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h2>Formulir pendaftaran sekolah</h2>
          <p>Isi informasi berikut dengan data yang paling mudah dihubungi dan dipahami oleh tim sekolah Anda.</p>
        </div>
        <div className={styles.formIntro}>
          <div>
            <strong>Waktu pengisian</strong>
            <span>Sekitar 3-5 menit</span>
          </div>
          <div>
            <strong>Siapkan</strong>
            <span>Kontak sekolah dan PIC</span>
          </div>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <h3>Profil sekolah</h3>
            <p>Ceritakan identitas sekolah Anda agar kami bisa memahami konteks dan skala kebutuhan.</p>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Nama sekolah</span>
              <input name="namaSekolah" className={styles.input} placeholder="SMA Islam Contoh" required />
            </label>

            <label className={styles.field}>
              <span>Jenjang</span>
              <select name="jenjang" className={styles.input} defaultValue="" required>
                <option value="" disabled>
                  Pilih jenjang
                </option>
                {jenjangOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Status sekolah</span>
              <select name="statusSekolah" className={styles.input} defaultValue="" required>
                <option value="" disabled>
                  Pilih status
                </option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>NPSN</span>
              <input name="npsn" className={styles.input} placeholder="Opsional" inputMode="numeric" />
            </label>

            <label className={styles.field}>
              <span>Email sekolah</span>
              <input name="emailSekolah" type="email" className={styles.input} placeholder="info@sekolah.sch.id" required />
            </label>

            <label className={styles.field}>
              <span>Telepon sekolah</span>
              <input name="teleponSekolah" className={styles.input} placeholder="021xxxxxxx" required />
            </label>

            <label className={styles.field}>
              <span>Provinsi</span>
              <input name="provinsi" className={styles.input} placeholder="Jawa Barat" required />
            </label>

            <label className={styles.field}>
              <span>Kota / kabupaten</span>
              <input name="kotaKabupaten" className={styles.input} placeholder="Bandung" required />
            </label>

            <label className={styles.field}>
              <span>Website saat ini</span>
              <input name="websiteSaatIni" className={styles.input} placeholder="Jika sudah ada, isi alamat website sekolah" />
            </label>

            <label className={styles.field}>
              <span>Estimasi jumlah siswa</span>
              <input
                name="jumlahSiswaSaatIni"
                type="number"
                min="0"
                className={styles.input}
                placeholder="Contoh: 540"
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Alamat sekolah</span>
            <textarea name="alamat" className={styles.textarea} rows={4} placeholder="Tuliskan alamat lengkap sekolah" required />
          </label>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <h3>Kontak penanggung jawab</h3>
            <p>Isi kontak orang yang paling tepat untuk dihubungi saat kami menindaklanjuti pendaftaran ini.</p>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Nama PIC</span>
              <input name="namaPic" className={styles.input} placeholder="Nama penanggung jawab" required />
            </label>

            <label className={styles.field}>
              <span>Jabatan PIC</span>
              <input name="jabatanPic" className={styles.input} placeholder="Kepala Sekolah / TU / Operator" required />
            </label>

            <label className={styles.field}>
              <span>Email PIC</span>
              <input name="emailPic" type="email" className={styles.input} placeholder="pic@sekolah.sch.id" required />
            </label>

            <label className={styles.field}>
              <span>WhatsApp PIC</span>
              <input name="whatsappPic" className={styles.input} placeholder="08xxxxxxxxxx" required />
            </label>
          </div>
        </div>

        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <h3>Kebutuhan sekolah</h3>
            <p>Bagian ini membantu kami memahami kebutuhan awal yang paling relevan untuk sekolah Anda.</p>
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Nama singkat sekolah untuk alamat SchoolPro</span>
              <input name="slugRequest" className={styles.input} placeholder="sman1-bandung" required />
              <small>Contoh: `sman1-bandung`. Ini membantu kami menyiapkan alamat awal sekolah Anda di SchoolPro.</small>
            </label>

            <label className={styles.field}>
              <span>Sumber lead</span>
              <select name="sumberLead" className={styles.input} defaultValue="">
                <option value="">Pilih sumber lead</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Kebutuhan utama</span>
            <textarea
              name="kebutuhanUtama"
              className={styles.textarea}
              rows={4}
              placeholder="Contoh: kami ingin mulai dari website sekolah yang mudah dikelola, lalu lanjut ke PPDB online."
              required
            />
          </label>

          <label className={styles.field}>
            <span>Catatan tambahan</span>
            <textarea
              name="catatanTambahan"
              className={styles.textarea}
              rows={3}
              placeholder="Opsional: target waktu launching, kebutuhan pelatihan, atau catatan lain yang ingin disampaikan."
            />
          </label>
        </div>

        <div className={styles.formActions}>
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
    </section>
  )
}
