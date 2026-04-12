'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Building2, Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Extract tenant slug from hostname if possible
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

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        tenantSlug,
      })

      if (result?.error) {
        setError('Email atau Kata Sandi salah')
        setLoading(false)
      } else {
        router.push('/app/dashboard')
      }
    } catch {
      setError('Terjadi kesalahan sistem')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
        <div className={styles.gridOverlay} />
      </div>

      {/* Login Card */}
      <div className={styles.card}>
        {/* Shimmer border */}
        <div className={styles.cardShimmer} />

        <div className={styles.header}>
          <div className={styles.logo}>
            <Building2 size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>SchoolPro</h1>
          <p className={styles.subtitle}>Sistem Informasi Sekolah Profesional</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && (
            <div className={styles.errorAlert}>
              {error}
            </div>
          )}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="login-email">
              Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="login-email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="Masukkan email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="login-password">
              Kata Sandi
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.options}>
            <label className={styles.remember}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.checkmark} />
              <span>Ingat saya</span>
            </label>
            <a href="#" className={styles.forgot}>Lupa kata sandi?</a>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>&copy; 2026 SchoolPro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
