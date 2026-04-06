import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Parse tenant from subdomain
  const hostname = request.headers.get('host') || ''
  let tenantSlug = 'demo' // default for localhost

  if (!hostname.includes('localhost') && !hostname.match(/^\d/)) {
    const parts = hostname.split('.')
    if (parts.length >= 3) {
      tenantSlug = parts[0]
    }
  }

  // Inject tenant slug into request headers
  const response = NextResponse.next()
  response.headers.set('x-tenant-slug', tenantSlug)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
