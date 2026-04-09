'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getTenantBySlug } from '@/lib/tenant'

export async function registerUser(formData: FormData, tenantSlug: string) {
  const nama = formData.get('nama') as string
  const email = formData.get('email') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!nama || !email || !username || !password) {
    return { error: 'Semua field harus diisi' }
  }

  try {
    const tenant = await getTenantBySlug(tenantSlug)
    if (!tenant) return { error: 'Tenant tidak valid' }

    // Check existing user in this tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return { error: 'Email atau Username sudah terdaftar' }
    }

    const passwordHash = await bcrypt.hash(password, 10)

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
