import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SISPRO — Sistem Informasi Sekolah Profesional',
  description: 'Platform manajemen sekolah all-in-one: tagihan, pembayaran, tabungan, PPDB, dan lainnya.',
  keywords: ['sistem informasi sekolah', 'manajemen sekolah', 'pembayaran sekolah', 'PPDB online'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
