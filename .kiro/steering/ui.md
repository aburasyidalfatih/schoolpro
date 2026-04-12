# SchoolPro — UI Components

## Import
Jika memakai komponen shared UI, import dari `@/components/ui` (barrel export via `index.ts`):
```tsx
import { Button, Modal, DataTable, Badge, ... } from '@/components/ui'
```

## Komponen

### Button
```tsx
<Button variant="primary|secondary|danger|ghost|success" size="sm|md|lg|icon" isLoading leftIcon rightIcon>
```

### Badge
```tsx
<Badge variant="primary|success|warning|danger|gray">Teks</Badge>
```

### Card
```tsx
<Card>
  <CardHeader><CardTitle>Judul</CardTitle></CardHeader>
  <CardBody>konten</CardBody>
</Card>
```

### Modal
```tsx
<Modal isOpen onClose={fn} title="Judul" footer={<>...</>} maxWidth="500px">
  konten
</Modal>
```
- Tutup otomatis dengan Escape key
- Klik overlay juga menutup modal

### DataTable
```tsx
const columns: Column<T>[] = [
  { header: 'Nama', accessor: 'nama' },
  { header: 'Aksi', accessor: (row) => <Button>Edit</Button>, align: 'center' },
]
<DataTable columns={columns} data={data} isLoading emptyMessage="..." />
```

### Input
```tsx
<Input label="Nama" error="pesan error" hint="petunjuk" icon={<Icon/>} required />
```

### Select
```tsx
<Select label="Kelas" options={[{ value: 'id', label: 'Nama' }]} placeholder="Pilih..." error required />
// atau pakai children <option> manual
```

### Textarea
```tsx
<Textarea label="Keterangan" error hint required />
```

### SearchInput
```tsx
<SearchInput placeholder="Cari..." value={q} onChange={fn} containerStyle={{ width: '400px' }} />
```

### Pagination
```tsx
<Pagination page={1} totalPages={10} totalItems={100} pageSize={10} onPageChange={fn} />
// Tidak render jika totalPages <= 1
```

### EmptyState
```tsx
<EmptyState icon={<Icon/>} title="Tidak ada data" description="..." action={<Button>Tambah</Button>} />
```

## Notifikasi
Pakai `sonner`:
```tsx
import { toast } from 'sonner'
toast.success('Berhasil disimpan')
toast.error('Gagal menyimpan')
```

## Charts
Pakai `recharts` — BarChart, LineChart, PieChart, dll.

## Aturan UI
- Gunakan token dan shared styles yang sudah ada bila sesuai; jangan hardcode warna jika token yang tepat sudah tersedia
- Pertahankan kompatibilitas Dark Mode pada area yang disentuh
- Icon dari `lucide-react`

## Aturan Admin dan Super Admin
- Prefer `DataTable`, `Modal`, `Badge`, `Button`, dan `@/styles/page.module.css` bila halaman mengikuti pola CRUD/tabel yang sudah ada
- Pastikan loading, submit, error, success, dan empty state tertangani jika relevan
- Utamakan layout yang rapih, padat, dan mudah dipindai daripada dekorasi baru
- Untuk area `super-admin`, selaraskan shell visual dengan area `/app` bila memungkinkan, tetapi tetap gunakan navigasi platform yang terpisah dari menu tenant
- Halaman tenant billing/langganan mengikuti pola admin card + table yang ringkas: summary subscription, grid plan, lalu riwayat order
- Untuk area tenant yang terpengaruh kuota siswa, tampilkan warning ringkas dan kontekstual di atas fold sebelum user mencoba aksi yang berpotensi ditolak
- Halaman tenant `Langganan` perlu mendukung retry/resubmit bukti pembayaran dari riwayat order tanpa memaksa tenant membuat order baru
- Untuk flow verifikasi billing super admin, utamakan tabel order + modal review daripada wizard multi-langkah
- Dashboard super admin dapat memakai hero ringkas + metric cards + panel operasional untuk menampilkan progres subscription tanpa mengubah shell platform

## Aturan Website Publik
- Jaga konsistensi visual dengan section sekitarnya; gunakan token skin-aware untuk surface website publik bila tersedia
- Untuk CTA website publik, copy, label tombol, dan tujuan link harus sinkron
- Untuk komponen website publik di mobile, pastikan floating controls tidak saling menutupi CTA atau konten bawah
- Untuk slider/carousel mobile, sinkronkan kontrol yang tampil dengan interaksi yang benar-benar didukung
- Jika slider utama konten publik dipakai di mobile, sediakan gesture swipe/touch selain autoplay agar navigasi tetap natural
- Card konten publik seperti pengumuman, blog, atau agenda sebaiknya menampilkan preview yang informatif
- Untuk section homepage yang memakai tombol prev/next, jaga konsistensi posisi, ukuran, dan treatment visual kontrol
- Hero website publik perlu padding horizontal yang aman agar heading, subtitle, dan kontrol tidak mepet viewport
