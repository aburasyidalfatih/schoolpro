# SchoolPro — UI Components

## Import
Semua komponen dari `@/components/ui` (barrel export via `index.ts`):
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
- Gunakan CSS Variables dari `globals.css`, jangan hardcode warna
- Semua komponen harus support Dark Mode
- Icon dari `lucide-react`
- Untuk komponen website publik di mobile, pastikan floating controls tidak saling menutupi CTA/konten bawah
- Untuk slider/carousel mobile, sinkronkan kontrol yang tampil dengan interaksi yang benar-benar didukung
- Jika slider utama konten publik dipakai di mobile, sediakan gesture swipe/touch selain autoplay agar navigasi tetap natural
- Card konten publik seperti pengumuman, blog, atau agenda sebaiknya menampilkan preview yang benar-benar informatif; utamakan 1-2 kalimat bermakna dibanding teaser yang terlalu pendek
- Untuk section homepage yang memakai tombol prev/next, samakan gaya kontrol dengan pola `Guru Terbaik Kami`: panah kiri/kanan ditempatkan di sisi konten utama pada desktop, dengan ukuran dan treatment visual yang konsisten
