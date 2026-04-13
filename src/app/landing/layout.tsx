import Script from 'next/script'
import './lp-schoolpro.css'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="/lp-schoolpro/main.js" strategy="afterInteractive" />
    </>
  )
}
