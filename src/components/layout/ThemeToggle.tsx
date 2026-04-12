'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from './ThemeToggle.module.css'

function resolveInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const saved = localStorage.getItem('schoolpro-theme')
  if (saved === 'light' || saved === 'dark') {
    return saved
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('schoolpro-theme', next)
  }

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
      aria-label="Toggle theme"
    >
      <span className={`${styles.iconWrap} ${theme === 'light' ? styles.active : ''}`}>
        <Sun size={16} />
      </span>
      <span className={`${styles.iconWrap} ${theme === 'dark' ? styles.active : ''}`}>
        <Moon size={16} />
      </span>
      <span className={styles.slider} style={{ transform: theme === 'dark' ? 'translateX(100%)' : 'translateX(0)' }} />
    </button>
  )
}
