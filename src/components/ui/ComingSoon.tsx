import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({ title = 'Segera Hadir', description = 'Fitur ini sedang dalam pengembangan.' }: ComingSoonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-tertiary)' }}>
      <Construction size={56} strokeWidth={1.5} style={{ opacity: 0.4 }} />
      <h2 style={{ fontSize: 'var(--sp-text-xl)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 'var(--sp-text-sm)', margin: 0 }}>{description}</p>
    </div>
  )
}
