---
inclusion: always
---

# SchoolPro — Konvensi Implementasi

Dokumen ini adalah aturan kerja harian supaya pengembangan tetap konsisten dengan struktur repo SchoolPro saat ini.

## Struktur Folder Aktif

```text
src/
  app/
    (public)/                  # website publik
    app/
      (portal)/
        (auth)/                # /app/login, /app/register
        (admin)/               # /app/dashboard, dst
        (wali)/                # /app area wali/siswa
    super-admin/               # area platform
    api/                       # route handlers

  components/
    ui/                        # komponen generik reusable
    layout/                    # shell/layout shared
    public/                    # komponen website publik

  features/
    website/
    ppdb/

  lib/
    auth/
    db/
    tenant/
    utils/
    constants/

  providers/
  styles/
  types/
```

## Aturan Penempatan Kode

- `src/app/*` hanya untuk route, page, layout, loading, error, dan route handler.
- `src/features/<domain>` untuk logic domain-specific yang tidak layak tinggal di page atau `lib`.
- `src/components/ui` hanya untuk komponen generik lintas domain.
- `src/components/layout` untuk shell aplikasi, bukan tempat business logic.
- `src/components/public` untuk UI website publik yang memang spesifik area public.
- `src/lib/*` hanya untuk shared infrastructure dan helper generik lintas domain.
- `src/providers/*` untuk React provider global.

## Dependency Rules

- `app` boleh impor dari `features`, `components`, `lib`, `providers`, dan `types`.
- `features` boleh impor dari `lib`, `components/ui`, dan `types`.
- `components/ui` tidak boleh impor logic domain dari `features`.
- `lib` tidak boleh impor dari `app` atau `features`.
- Antar-domain di `features` jangan saling bergantung langsung tanpa alasan kuat. Jika benar-benar shared, pindahkan ke `lib` atau `features/shared`.

## Pola Fetch Data

- Pertahankan pola yang sudah ada pada modul yang disentuh: client `fetch` ke API route atau server action yang sudah eksis.
- Jangan memaksa migrasi penuh ke pattern baru tanpa alasan kuat.
- Response API tetap kompatibel dengan pola saat ini:
  - sukses: `{ data: ... }`
  - gagal: `{ error: '...' }`

Contoh:

```ts
const res = await fetch('/api/modul/resource')
const json = await res.json()

if (!res.ok) {
  toast.error(json.error || 'Terjadi kesalahan')
  return
}

setData(json.data)
```

## Pola API Route

```ts
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSession = session.user as any
    const tenantId = userSession.tenantId

    const result = await prisma.model.findMany({
      where: { tenantId },
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[MODULE_HANDLER]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## Multi-Tenant Safety

- Semua read/write tenant harus discope dengan `tenantId`, kecuali flow `super-admin` yang memang lintas tenant.
- Query agregat tetap wajib dievaluasi scope tenant-nya.
- Jangan pernah mengandalkan filter di client untuk membatasi data tenant.
- Saat context user tidak jelas, fail closed.

## Session dan Auth

- Server-side: gunakan `auth()` dan akses `session.user as any`.
- Client-side: gunakan `useSession()` hanya bila benar-benar perlu state session di client.
- Jangan menambah auth helper baru bila pola `auth()` yang ada sudah cukup.

## Import dan Helper Shared

Gunakan boundary import aktif berikut:

- `@/lib/db/prisma`
- `@/lib/auth`
- `@/lib/tenant`
- `@/lib/utils`

Jangan membuat import baru ke path lama seperti:

- `@/lib/prisma`
- `@/lib/auth.ts`
- `@/lib/tenant.ts`
- `@/lib/utils.ts`

## Validasi Input

- Saat ini validasi mayoritas masih manual. Pertahankan pola ini kecuali modul memang sedang dinaikkan kualitasnya.
- Validasi field wajib di awal handler/action.
- Return error 4xx yang jelas untuk kesalahan input user.

## Client Async State

- Loading page-level: `loading`
- Submit state: `isSubmitting`
- Komponen UI reusable boleh memakai `isLoading` jika itu pola lokal komponen

Contoh:

```ts
try {
  setIsSubmitting(true)
  const res = await fetch('/api/...', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await res.json()
  if (!res.ok) {
    toast.error(json.error || 'Gagal menyimpan data')
    return
  }

  toast.success('Berhasil disimpan')
  await fetchData()
} catch {
  toast.error('Terjadi kesalahan')
} finally {
  setIsSubmitting(false)
}
```

## Styling

- Gunakan token yang sudah ada di `globals.css`, `website.css`, dan style module area terkait.
- CSS Modules tetap jadi default untuk halaman/komponen spesifik.
- Jangan hardcode warna jika ada token yang cocok.
- Dark mode tidak boleh rusak karena perubahan baru.
- `lucide-react` tetap jadi icon default.

## Naming

- Komponen: PascalCase
- Variabel/fungsi: camelCase
- Folder route/API: kebab-case jika memang route publik/admin membutuhkan itu
- Label map/status map: simpan dekat domain yang memakainya, bukan di halaman bila dipakai berulang

## Kapan Perlu Memindahkan Kode ke `features/*`

Pindahkan jika salah satu kondisi ini benar:
- logic domain dipakai lebih dari satu page/route
- `page.tsx` mulai penuh query/mapping/formatter domain
- ada server action domain-specific yang bukan shared infra
- ada status map, option list, atau rule bisnis yang mulai berulang

Jangan pindahkan jika:
- perubahan hanya bugfix kecil satu file
- helper benar-benar generic dan layak tetap di `lib`
- perpindahan folder tidak memberi boundary yang lebih jelas
