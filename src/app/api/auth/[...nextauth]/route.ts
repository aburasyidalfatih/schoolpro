import { NextRequest, NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'

function getExternalOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get('x-forwarded-host')
  const host = forwardedHost || req.headers.get('host')
  if (!host) return null

  const forwardedProto = req.headers.get('x-forwarded-proto')
  const normalizedHost = host.split(',')[0].trim()
  const normalizedProto = (forwardedProto || (normalizedHost.includes('localhost') ? 'http' : 'https'))
    .split(',')[0]
    .trim()

  return `${normalizedProto}://${normalizedHost}`
}

function isLocalHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function normalizeRedirectLocation(response: NextResponse, req: NextRequest) {
  const origin = getExternalOrigin(req)
  const location = response.headers.get('location')
  if (!origin || !location) return

  try {
    const targetUrl = new URL(location, origin)

    const externalUrl = new URL(origin)
    const shouldNormalizeOrigin =
      isLocalHostname(targetUrl.hostname) ||
      targetUrl.origin !== externalUrl.origin

    if (!shouldNormalizeOrigin) return

    targetUrl.protocol = externalUrl.protocol
    targetUrl.hostname = externalUrl.hostname
    targetUrl.port = externalUrl.port
    response.headers.set('location', targetUrl.toString())
  } catch {
    // Ignore malformed redirect targets and preserve the original response.
  }
}

function normalizeAuthResponse(response: Response, req: NextRequest) {
  const origin = getExternalOrigin(req)
  if (!origin) return response

  const nextResponse = new NextResponse(response.body, response)
  const isSecure = origin.startsWith('https://')

  nextResponse.cookies.delete('__Secure-authjs.callback-url')
  nextResponse.cookies.delete('authjs.callback-url')
  nextResponse.cookies.set(isSecure ? '__Secure-authjs.callback-url' : 'authjs.callback-url', origin, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
  })

  normalizeRedirectLocation(nextResponse, req)

  return nextResponse
}

export async function GET(req: NextRequest) {
  const response = await handlers.GET(req)
  return normalizeAuthResponse(response, req)
}

export async function POST(req: NextRequest) {
  const response = await handlers.POST(req)
  return normalizeAuthResponse(response, req)
}
