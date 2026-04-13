import Script from 'next/script'
import '../landing/lp-schoolpro.css'

export default function TenantApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="/lp-schoolpro/main.js" strategy="afterInteractive" />
    </>
  )
}
