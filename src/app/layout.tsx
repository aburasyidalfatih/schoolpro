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
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sispro-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
