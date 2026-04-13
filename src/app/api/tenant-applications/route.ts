import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

function sanitizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function sanitizeOptionalString(value: unknown) {
  const normalized = sanitizeString(value)
  return normalized || null
}

function normalizeSlug(value: unknown) {
  return sanitizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parsePositiveInt(value: unknown) {
  const normalized = sanitizeString(value)
  if (!normalized) return null

  const parsed = Number.parseInt(normalized, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

async function buildApplicationCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
    const candidate = `TA-${datePart}-${randomPart}`

    const existing = await prisma.tenantApplication.findUnique({
      where: { applicationCode: candidate },
      select: { id: true },
    })

    if (!existing) {
      return candidate
    }
  }

  throw new Error('FAILED_TO_GENERATE_APPLICATION_CODE')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const payload = {
      namaSekolah: sanitizeString(body.namaSekolah),
      jenjang: sanitizeString(body.jenjang),
      statusSekolah: sanitizeString(body.statusSekolah),
      npsn: sanitizeOptionalString(body.npsn),
      emailSekolah: sanitizeString(body.emailSekolah).toLowerCase(),
      teleponSekolah: sanitizeString(body.teleponSekolah),
      alamat: sanitizeString(body.alamat),
      provinsi: sanitizeString(body.provinsi),
      kotaKabupaten: sanitizeString(body.kotaKabupaten),
      websiteSaatIni: sanitizeOptionalString(body.websiteSaatIni),
      jumlahSiswaSaatIni: parsePositiveInt(body.jumlahSiswaSaatIni),
      namaPic: sanitizeString(body.namaPic),
      jabatanPic: sanitizeString(body.jabatanPic),
      emailPic: sanitizeString(body.emailPic).toLowerCase(),
      whatsappPic: sanitizeString(body.whatsappPic),
      slugRequest: normalizeSlug(body.slugRequest),
      kebutuhanUtama: sanitizeString(body.kebutuhanUtama),
      catatanTambahan: sanitizeOptionalString(body.catatanTambahan),
      sumberLead: sanitizeOptionalString(body.sumberLead),
    }

    if (
      !payload.namaSekolah ||
      !payload.jenjang ||
      !payload.statusSekolah ||
      !payload.emailSekolah ||
      !payload.teleponSekolah ||
      !payload.alamat ||
      !payload.provinsi ||
      !payload.kotaKabupaten ||
      !payload.namaPic ||
      !payload.jabatanPic ||
      !payload.emailPic ||
      !payload.whatsappPic ||
      !payload.slugRequest ||
      !payload.kebutuhanUtama
    ) {
      return NextResponse.json({ error: 'Lengkapi semua field wajib sebelum mengirim aplikasi.' }, { status: 400 })
    }

    if (!isValidEmail(payload.emailSekolah) || !isValidEmail(payload.emailPic)) {
      return NextResponse.json({ error: 'Format email sekolah atau PIC belum valid.' }, { status: 400 })
    }

    if (!isValidSlug(payload.slugRequest) || payload.slugRequest.length < 3) {
      return NextResponse.json(
        { error: 'Slug sekolah minimal 3 karakter dan hanya boleh berisi huruf kecil, angka, atau tanda hubung.' },
        { status: 400 }
      )
    }

    const [existingTenant, existingApplication] = await Promise.all([
      prisma.tenant.findUnique({
        where: { slug: payload.slugRequest },
        select: { id: true },
      }),
      prisma.tenantApplication.findFirst({
        where: {
          slugRequest: payload.slugRequest,
          status: {
            notIn: ['REJECTED'],
          },
        },
        select: {
          id: true,
          applicationCode: true,
        },
      }),
    ])

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Slug sekolah tersebut sudah dipakai tenant aktif. Silakan pilih slug lain.' },
        { status: 409 }
      )
    }

    if (existingApplication) {
      return NextResponse.json(
        {
          error: `Slug sekolah tersebut sudah dipakai pada aplikasi lain. Gunakan slug berbeda atau cek aplikasi ${existingApplication.applicationCode}.`,
        },
        { status: 409 }
      )
    }

    const applicationCode = await buildApplicationCode()

    const created = await prisma.tenantApplication.create({
      data: {
        applicationCode,
        ...payload,
        submittedAt: new Date(),
      },
      select: {
        id: true,
        applicationCode: true,
      },
    })

    return NextResponse.json(
      {
        data: {
          id: created.id,
          applicationCode: created.applicationCode,
          status: 'SUBMITTED',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[TENANT_APPLICATION_CREATE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
