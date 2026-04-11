'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, UserPlus, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { registerUser } from '@/actions/auth-actions'
import styles from './page.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Extract tenant slug from hostname
  let tenantSlug = 'demo'
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (!hostname.includes('localhost') && !hostname.match(/^\d/)) {
      const parts = hostname.split('.')
      if (parts.length >= 3) {
        tenantSlug = parts[0]
      }
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await registerUser(formData, tenantSlug)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/app/login')
        }, 3000)
      }
    } catch {
      setError('Terjadi kesalahan sistem')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} />
            </div>
            <h2 className={styles.title}>Registrasi Berhasil!</h2>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
              Akun Anda telah berhasil dibuat. Anda akan diarahkan ke halaman login dalam beberapa detik.
            </p>
            <Link href="/app/login" className={styles.submitBtn}>
              Ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.gridOverlay} />
      </div>

      <div className={styles.card}>
        <Link href="/ppdb" className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={styles.header}>
          <div className={styles.logo}>
            <UserPlus size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Daftar Akun</h1>
          <p className={styles.subtitle}>Buat akun untuk memulai pendaftaran PPDB</p>
        </div>

        <form className={styles.form} onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs text-center animate-shake">
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nama Lengkap</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                name="nama"
                type="text"
                className={styles.input}
                placeholder="Nama lengkap pendaftar"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                name="email"
                type="email"
                className={styles.input}
                placeholder="alamat@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Username</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                name="username"
                type="text"
                className={styles.input}
                placeholder="Pilih username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Kata Sandi</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                name="password"
                type="password"
                className={styles.input}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Buat Akun</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.loginLink}>
          Sudah punya akun? <Link href="/app/login">Masuk sekarang</Link>
        </div>
      </div>
    </div>
  )
}
