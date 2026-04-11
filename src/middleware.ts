import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const protectedRoutes = ['/app/dashboard', '/app/data-master', '/app/tagihan', '/app/pembayaran', '/app/transaksi', '/app/arus-kas', '/app/tabungan', '/app/laporan', '/app/berita', '/app/notifikasi', '/app/pengaturan', '/app/peralatan', '/app/e-kantin', '/app/ai', '/app/beranda', '/app/ppdb', '/app/profil']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // 1. Tenant Resolution
  const hostname = req.headers.get('host') || ''
  let tenantSlug = 'demo'
  let isLandingPage = false

  if (!hostname.includes('localhost') && !hostname.match(/^\d/)) {
    const parts = hostname.split('.')
    // If hostname is exactly schoolpro.id (no subdomain) → Landing page
    if (parts.length === 2 && parts[0] === 'schoolpro' && parts[1] === 'id') {
      isLandingPage = true
      // Rewrite root to /landing (keep URL as schoolpro.id/)
      if (pathname === '/') {
        return NextResponse.rewrite(new URL('/landing', req.nextUrl))
      }
    } else if (parts.length >= 3) {
      tenantSlug = parts[0]
    }
  }

  // Skip tenant resolution for landing page routes
  if (isLandingPage && pathname.startsWith('/landing')) {
    return NextResponse.next()
  }

  // 2. Authentication Protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = pathname.startsWith('/app/login')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/app/login', req.nextUrl))
  }

  // Redirect non-admin users away from admin dashboard
  if (pathname.startsWith('/app/dashboard') && isLoggedIn) {
    const role = (req.auth?.user as any)?.role as string
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
    }
  }

  if (isAuthRoute && isLoggedIn) {
    const role = (req.auth?.user as any)?.role as string
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl))
  }

  // 3. Inject Tenant Context
  const response = NextResponse.next()
  response.headers.set('x-tenant-slug', tenantSlug)

  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
