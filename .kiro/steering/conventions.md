# SchoolPro — Konvensi Kode

## Struktur Folder
```
src/
├── app/
│   ├── api/                        # API Routes (REST)
│   │   └── [modul]/[resource]/
│   │       ├── route.ts            # GET, POST
│   │       └── [id]/route.ts       # GET, PUT, DELETE by ID
│   └── app/
│       ├── (admin)/[modul]/page.tsx  # Halaman admin
│       └── (wali)/[modul]/page.tsx   # Halaman wali/siswa
├── components/
│   ├── ui/                         # Komponen UI reusable
│   └── layout/                     # Header, Sidebar
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Helper functions
└── styles/
    └── page.module.css             # Shared page styles
```

## Pola Fetch Data
- Semua halaman pakai `'use client'` + `fetch` ke API Routes
- Tidak ada Server Actions — semua mutasi lewat API Routes (`/api/...`)
- Pattern fetch:
```ts
const res = await fetch('/api/modul/resource')
const json = await res.json()
if (json.data) setData(json.data)
```
- Response API selalu: `{ data: ... }` untuk sukses, `{ error: '...' }` untuk gagal

## Pola API Route
```ts
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userSession = session.user as any
    // query dengan tenantId: userSession.tenantId
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[NAMA_HANDLER]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## Ambil Session & TenantId
```ts
// Di API Route
const session = await auth()
const userSession = session.user as any
const tenantId = userSession.tenantId
const userId = userSession.id
const role = userSession.role

// Di Client Component
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
const userSession = session?.user as any
```

## Role Check di API
```ts
if (!['ADMIN', 'TU'].includes(userSession.role)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Validasi Input
- Validasi manual (tidak pakai Zod)
- Cek field wajib di awal handler POST/PUT
```ts
if (!fieldWajib) return NextResponse.json({ error: 'Field wajib diisi' }, { status: 400 })
```

## Error Handling di Client
```ts
try {
  setIsSubmitting(true)
  const res = await fetch('/api/...', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
  const json = await res.json()
  if (!res.ok) { toast.error(json.error || 'Gagal'); return }
  toast.success('Berhasil')
  fetchData()
} catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
```

## Helper Functions (`@/lib/utils`)
- `formatCurrency(amount)` — format Rupiah
- `formatDate(date)` — format tanggal Indonesia
- `formatDateTime(date)` — format tanggal + jam
- `generateTransactionNumber(prefix)` — generate no. transaksi unik
- `slugify(text)` — buat slug dari teks
- `cn(...classes)` — gabung className kondisional
- `getInitials(name)` — ambil inisial nama

## Styling
- CSS Modules untuk komponen spesifik
- `@/styles/page.module.css` untuk shared page layout
- CSS Variables dari `globals.css` untuk warna/spacing
- Jangan hardcode warna — pakai `var(--color-name)`
- Icon dari `lucide-react`

## Konvensi Penamaan
- File komponen: PascalCase (`SiswaPage.tsx`)
- API routes: kebab-case folder (`/api/data-master/tahun-ajaran/`)
- Variabel/fungsi: camelCase
- State loading: `loading` (bukan `isLoading` di page, tapi `isLoading` di komponen UI)
- State submit: `isSubmitting`
