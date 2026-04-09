---
inclusion: always
---

# SchoolPro Design System — Panduan Konsistensi

## CSS Variables yang Benar

Selalu gunakan variabel dari `globals.css`. Jangan hardcode warna atau ukuran.

### Text
- `--text-primary` — teks utama
- `--text-secondary` — teks sekunder
- `--text-tertiary` — teks muted/placeholder
- `--text-inverse` — teks di atas background gelap

### Background
- `--bg-primary` — background halaman
- `--bg-secondary` — background card/input
- `--bg-tertiary` — background subtle
- `--card-bg` — alias untuk card background

### Alias (untuk kompatibilitas CSS modules lama)
- `--text-color` → alias `--text-primary`
- `--text-muted` → alias `--text-tertiary`
- `--bg-color` → alias `--bg-secondary`
- `--bg-hover` → alias `--gray-100` (light) / `rgba(255,255,255,0.06)` (dark)
- `--hover-color` → alias `--primary-50` (light) / `rgba(99,102,241,0.08)` (dark)

## Komponen UI — Cara Pakai

Import dari barrel export:
```tsx
import { Button, Input, Select, Modal, DataTable, Badge, Pagination, SearchInput, EmptyState } from '@/components/ui'
```

## Shared Page Styles

Untuk halaman admin baru, import shared styles:
```tsx
import shared from '@/styles/page.module.css'
```

Gunakan class: `shared.container`, `shared.header`, `shared.title`, `shared.subtitle`, `shared.toolbar`, `shared.search`, `shared.formInput`, dll.

## Pola Halaman Admin Standar

```tsx
export default function HalamanPage() {
  return (
    <div className={shared.container}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.title}>Judul Halaman</h1>
          <p className={shared.subtitle}>Deskripsi singkat</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Tambah Data</Button>
      </div>

      <div className={shared.toolbar}>
        <SearchInput placeholder="Cari..." value={q} onChange={...} />
      </div>

      <DataTable columns={columns} data={data} isLoading={loading} />
    </div>
  )
}
```

## Aturan Dark Mode

- JANGAN hardcode `background: white` atau `color: black`
- SELALU gunakan CSS variables
- Test setiap komponen di dark mode

## Notifikasi / Toast

Selalu gunakan `sonner` (sudah terpasang):
```tsx
import { toast } from 'sonner'
toast.success('Data berhasil disimpan')
toast.error('Terjadi kesalahan')
```

Jangan gunakan `alert()` atau `window.confirm()` — ganti dengan Modal konfirmasi.
