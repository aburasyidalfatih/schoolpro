'use server'

import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { getTenantBySlug } from '@/lib/tenant'

function slugifyUsernameCandidate(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/@.*$/, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

  return normalized || 'user'
}

async function buildUniqueUsername(tenantId: string, email: string) {
  const base = slugifyUsernameCandidate(email)
  let candidate = base
  let counter = 1

  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        tenantId,
        username: candidate,
      },
      select: { id: true },
    })

    if (!existing) {
      return candidate
    }

    counter += 1
    candidate = `${base}.${counter}`
  }
}

export async function registerUser(formData: FormData, tenantSlug: string) {
  const nama = formData.get('nama') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!nama || !email || !password) {
    return { error: 'Semua field harus diisi' }
  }

  try {
    const tenant = await getTenantBySlug(tenantSlug)
    if (!tenant) return { error: 'Tenant tidak valid' }

    // Check existing user in this tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email,
      },
    })

    if (existingUser) {
      return { error: 'Email sudah terdaftar' }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const username = await buildUniqueUsername(tenant.id, email)

    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        nama,
        email,
        username,
        passwordHash,
        role: 'USER',
        isActive: true,
      },
    })

    return { success: true }
  } catch (err) {
    console.error('Registration error:', err)
    return { error: 'Gagal melakukan registrasi. Silakan coba lagi.' }
  }
}
