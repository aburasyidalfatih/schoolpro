'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check saved preference or system preference
    const saved = localStorage.getItem('sispro-theme') as 'light' | 'dark' | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (systemDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('sispro-theme', next)
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
