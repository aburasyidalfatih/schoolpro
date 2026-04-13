import { getWebsiteTenant } from '@/lib/tenant'
import { getWebsiteHomeData } from '@/features/website/lib/website-data'
import HeroSlider from '@/components/public/home/HeroSlider'
import StatsCounter from '@/components/public/home/StatsCounter'
import AgendaSection from '@/components/public/home/AgendaSection'
import PengumumanSection from '@/components/public/home/PengumumanSection'
import PrestasiSection from '@/components/public/home/PrestasiSection'
import GuruSection from '@/components/public/home/GuruSection'
import BlogSection from '@/components/public/home/BlogSection'
import TestimonialSection from '@/components/public/home/TestimonialSection'
import FasilitasSection from '@/components/public/home/FasilitasSection'
import EkskulSection from '@/components/public/home/EkskulSection'
import CTASection from '@/components/public/home/CTASection'

function getObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getStringValue(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function getNumberValue(record: Record<string, unknown>, key: string): number {
  const value = record[key]
  return typeof value === 'number' ? value : 0
}

function isDateLikeObject(value: unknown): value is { toISOString: () => string } {
  return !!value && typeof value === 'object' && typeof (value as { toISOString?: unknown }).toISOString === 'function'
}

function toIsoDate(value: unknown): string {
  if (isDateLikeObject(value)) {
    return value.toISOString()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return new Date().toISOString()
}

export default async function HomePage() {
  const tenant = await getWebsiteTenant()
  if (!tenant) return <div style={{ padding: '4rem', textAlign: 'center' }}>Sekolah tidak ditemukan.</div>

  const { slides, pengumuman, agenda, prestasi, gurus, blogs, fasilitas, ekskul } =
    await getWebsiteHomeData(tenant.id)

  const pengaturan = getObjectRecord(tenant.pengaturan)
  const stats = {
    students: getNumberValue(pengaturan, 'statsStudents'),
    teachers: getNumberValue(pengaturan, 'statsTeachers'),
    achievements: getNumberValue(pengaturan, 'statsAchieve'),
    extracurriculars: getNumberValue(pengaturan, 'statsEkskul'),
  }

  const mappedSlides = slides.map(s => ({
    id: s.id,
    image: s.gambarUrl || '',
    title: s.judul || '',
    subtitle: s.subjudul || '',
    cta: s.linkUrl ? 'Lihat Detail' : null,
    ctaLink: s.linkUrl || null,
  }))

  const mappedAgenda = agenda.map(a => ({
    id: a.id,
    slug: a.slug || String(a.id),
    title: a.judul,
    date: toIsoDate(a.tanggalMulai),
    time: a.waktu || '',
    location: a.lokasi || '',
    category: a.kategori || 'kegiatan',
    image: a.gambarUrl || null,
  }))

  const mappedPengumuman = pengumuman.map(p => ({
    id: p.id,
    slug: p.slug || String(p.id),
    title: p.judul,
    date: toIsoDate(p.tanggal),
    summary: p.ringkasan || '',
    content: p.konten || '',
    priority: p.prioritas || 'normal',
  }))

  const mappedPrestasi = prestasi.map(p => ({
    id: p.id,
    slug: p.slug || String(p.id),
    title: p.judul,
    date: toIsoDate(p.createdAt),
    level: p.tingkat || 'kota',
    category: p.kategori || '',
    student: p.siswa || '',
    achievement: p.pencapaian || '',
    image: p.gambarUrl || null,
  }))

  const mappedGurus = gurus.map(g => ({
    id: g.id,
    slug: g.slug || String(g.id),
    name: g.nama,
    photo: g.foto || '/globe.svg',
    jabatan: g.jabatan || '',
    jabatanLabel: g.jabatanLabel || '',
    bidang: g.bidang || '',
    pendidikan: g.pendidikan || '',
    bio: g.bio || '',
    quote: g.quote || null,
    nip: g.nip || null,
    orderIndex: g.urutan ?? 0,
  }))

  const mappedBlogs = blogs.map(b => ({
    id: b.id,
    slug: b.slug || String(b.id),
    title: b.judul,
    date: toIsoDate(b.createdAt),
    excerpt: b.ringkasan || '',
    author: b.penulis || '',
    authorPhoto: b.fotoPenulis || '/globe.svg',
    category: b.kategori || '',
    image: b.gambarUrl || null,
  }))

  const mappedFasilitas = fasilitas.map(f => ({
    id: f.id,
    slug: f.slug || String(f.id),
    name: f.nama,
    category: f.kategori || '',
    capacity: f.kapasitas ? String(f.kapasitas) : null,
    image: f.gambarUrl || null,
  }))

  const mappedEkskul = ekskul.map(e => ({
    id: e.id,
    slug: e.slug || String(e.id),
    name: e.nama,
    category: e.kategori || '',
    day: e.hari || '',
    memberCount: e.jumlahAnggota || 0,
    maxMembers: e.maxAnggota || 0,
    registrationOpen: e.pendaftaranBuka ?? true,
    image: e.gambarUrl || null,
  }))

  return (
    <>
      <HeroSlider slides={mappedSlides} />
      <StatsCounter stats={stats} akreditasi={getStringValue(pengaturan, 'akreditasi')} />
      <AgendaSection agenda={mappedAgenda} />
      <PengumumanSection latestPengumuman={mappedPengumuman} />
      <PrestasiSection prestasi={mappedPrestasi} />
      <GuruSection gurus={mappedGurus} />
      <BlogSection blogs={mappedBlogs} />
      <TestimonialSection />
      <FasilitasSection fasilitas={mappedFasilitas} />
      <EkskulSection ekskul={mappedEkskul} />
      <CTASection />
    </>
  )
}
