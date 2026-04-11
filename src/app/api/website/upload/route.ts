import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Hanya JPG, PNG, WEBP, GIF' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Maksimal 5MB' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'website')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ url: `/uploads/website/${filename}` })
  } catch {
    return NextResponse.json({ error: 'Gagal upload' }, { status: 500 })
  }
}
