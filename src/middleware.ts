import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPlatformHost, getTenantHost, resolveAppContext } from '@/lib/runtime/app-context'

const protectedRoutes = ['/app/dashboard', '/app/data-master', '/app/tagihan', '/app/pembayaran', '/app/transaksi', '/app/arus-kas', '/app/tabungan', '/app/laporan', '/app/berita', '/app/notifikasi', '/app/pengaturan', '/app/peralatan', '/app/e-kantin', '/app/ai', '/app/beranda', '/app/ppdb', '/app/profil']
const superAdminRoutes = ['/super-admin']
const tenantPublicRoutes = ['/agenda', '/blog', '/editorial', '/ekskul', '/fasilitas', '/guru', '/kontak', '/pengumuman', '/prestasi', '/profil', '/ppdb']

function buildExternalUrl(_req: Parameters<Parameters<typeof auth>[0]>[0], host: string, pathname: string) {
  const url = new URL(`https://${host}`)
  url.pathname = pathname
  url.search = ''
  return url
}

function buildForwardedHeaders(req: Parameters<Parameters<typeof auth>[0]>[0], hostname: string) {
  const headers = new Headers(req.headers)
  const host = hostname.split(':')[0]
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  const proto = isLocal ? 'http' : 'https'
  const port = isLocal ? '3001' : '443'

  headers.set('x-forwarded-host', host)
  headers.set('x-forwarded-proto', proto)
  headers.set('x-forwarded-port', port)

  return headers
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const hostname = req.headers.get('host') || ''
  const context = resolveAppContext(hostname)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route))
  const isTenantPublicRoute = tenantPublicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRoute = pathname.startsWith('/app/login')
  const isAuthApiRoute = pathname.startsWith('/api/auth')
  const isPlatformApiRoute = pathname.startsWith('/api/super-admin')
  const user = req.auth?.user as { role?: string } | undefined
  const role = user?.role
  const isPlatformUser = role === 'SUPER_ADMIN'
  const tenantSlug = context.appType === 'tenant' ? context.tenantSlug : ''

  if (context.appType === 'marketing') {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/landing', req.nextUrl))
    }

    if (pathname === '/landing') {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    if (isAuthRoute) {
      return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), '/app/login'))
    }

    if (isSuperAdminRoute) {
      return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), isLoggedIn ? '/super-admin/dashboard' : '/app/login'))
    }

    if (isTenantPublicRoute) {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }

  if (context.appType === 'platform') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(isLoggedIn && isPlatformUser ? '/super-admin/dashboard' : '/app/login', req.nextUrl))
    }

    if (!isSuperAdminRoute && !isAuthRoute && !isAuthApiRoute && !isPlatformApiRoute) {
      return NextResponse.redirect(new URL(isLoggedIn && isPlatformUser ? '/super-admin/dashboard' : '/app/login', req.nextUrl))
    }
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/app/login', req.nextUrl))
  }

  if (isSuperAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/app/login', req.nextUrl))
  }

  if (isSuperAdminRoute && isLoggedIn && !isPlatformUser) {
    if (context.appType === 'tenant' && role && role !== 'SUPER_ADMIN') {
      if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
        return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
      }
      return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl))
    }
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl))
  }

  if (context.appType === 'tenant' && isSuperAdminRoute && isPlatformUser) {
    return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), '/super-admin/dashboard'))
  }

  if (pathname.startsWith('/app/dashboard') && isLoggedIn) {
    if (isPlatformUser) {
      if (context.appType === 'platform') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.nextUrl))
      }
      return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), '/super-admin/dashboard'))
    }
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
    }
  }

  if (pathname.startsWith('/app/') && isLoggedIn && isPlatformUser && !isAuthRoute) {
    if (context.appType === 'platform') {
      return NextResponse.redirect(new URL('/super-admin/dashboard', req.nextUrl))
    }
    return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), '/super-admin/dashboard'))
  }

  if (isAuthRoute && isLoggedIn) {
    if (isPlatformUser) {
      if (context.appType === 'platform') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', req.nextUrl))
      }
      if (context.appType !== 'tenant') {
        return NextResponse.redirect(buildExternalUrl(req, getPlatformHost(hostname), '/super-admin/dashboard'))
      }

      return NextResponse.next({
        request: {
          headers: buildForwardedHeaders(req, hostname),
        },
      })
    }
    if (context.appType !== 'tenant' && req.auth?.user && 'tenantSlug' in req.auth.user && typeof req.auth.user.tenantSlug === 'string') {
      const tenantHost = getTenantHost(req.auth.user.tenantSlug, hostname)
      if (tenantHost) {
        return NextResponse.redirect(buildExternalUrl(req, tenantHost, role === 'WALI' || role === 'SISWA' || role === 'USER' ? '/app/beranda' : '/app/dashboard'))
      }
    }
    if (role === 'WALI' || role === 'SISWA' || role === 'USER') {
      return NextResponse.redirect(new URL('/app/beranda', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/app/dashboard', req.nextUrl))
  }

  const forwardedHeaders = buildForwardedHeaders(req, hostname)
  const response = NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  })
  response.headers.set('x-app-type', context.appType)
  if (context.appType === 'tenant') {
    response.headers.set('x-tenant-slug', tenantSlug)
  }

  return response
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
