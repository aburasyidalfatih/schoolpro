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

function normalizeAuthCallbackCookie(response: Response, req: NextRequest) {
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

  return nextResponse
}

export async function GET(req: NextRequest) {
  const response = await handlers.GET(req)
  return normalizeAuthCallbackCookie(response, req)
}

export async function POST(req: NextRequest) {
  const response = await handlers.POST(req)
  return normalizeAuthCallbackCookie(response, req)
}
