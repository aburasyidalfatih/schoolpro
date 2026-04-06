import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/data-master', '/tagihan', '/pembayaran', '/transaksi', '/beranda']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // 1. Tenant Resolution
  const hostname = req.headers.get('host') || ''
  let tenantSlug = 'demo'

  if (!hostname.includes('localhost') && !hostname.match(/^\d/)) {
    const parts = hostname.split('.')
    if (parts.length >= 3) {
      tenantSlug = parts[0]
    }
  }

  // 2. Authentication Protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = pathname.startsWith('/login')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthRoute && isLoggedIn) {
    const role = (req.auth?.user as any)?.role as string
    // Redirect based on role
    if (role === 'WALI' || role === 'SISWA') {
      return NextResponse.redirect(new URL('/beranda', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // 3. Inject Tenant Context
  const response = NextResponse.next()
  response.headers.set('x-tenant-slug', tenantSlug)

  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
