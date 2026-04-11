import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import HeroSlider from '@/components/website/home/HeroSlider'
import StatsCounter from '@/components/website/home/StatsCounter'
import AgendaSection from '@/components/website/home/AgendaSection'
import PengumumanSection from '@/components/website/home/PengumumanSection'
import PrestasiSection from '@/components/website/home/PrestasiSection'
import GuruSection from '@/components/website/home/GuruSection'
import BlogSection from '@/components/website/home/BlogSection'
import TestimonialSection from '@/components/website/home/TestimonialSection'
import FasilitasSection from '@/components/website/home/FasilitasSection'
import EkskulSection from '@/components/website/home/EkskulSection'
import CTASection from '@/components/website/home/CTASection'

async function getTenant() {
  const headersList = await headers()
  const slug = headersList.get('x-tenant-slug') || 'demo'
  return prisma.tenant.findFirst({ where: { slug, isActive: true } })
}

export default async function HomePage() {
  const tenant = await getTenant()
  if (!tenant) return <div style={{ padding: '4rem', textAlign: 'center' }}>Sekolah tidak ditemukan.</div>

  const [slides, pengumuman, agenda, prestasi, gurus, blogs, fasilitas, ekskul] = await Promise.all([
    prisma.slider.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { urutan: 'asc' } }),
    prisma.pengumuman.findMany({ where: { tenantId: tenant.id }, orderBy: { tanggal: 'desc' }, take: 4 }),
    prisma.agenda.findMany({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { tanggalMulai: 'asc' }, take: 6 }),
    prisma.prestasi.findMany({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.guru.findMany({ where: { tenantId: tenant.id }, orderBy: { urutan: 'asc' }, take: 10 }),
    prisma.blog.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.fasilitas.findMany({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.ekskul.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  const pengaturan = (tenant.pengaturan as any) || {}
  const stats = {
    students: pengaturan.statsStudents || 0,
    teachers: pengaturan.statsTeachers || 0,
    achievements: pengaturan.statsAchieve || 0,
    extracurriculars: pengaturan.statsEkskul || 0,
  }

  const mappedSlides = slides.map(s => ({
    id: s.id, image: (s as any).gambarUrl || '', title: (s as any).judul || '',
    subtitle: (s as any).subjudul || '', cta: (s as any).ctaText || null, ctaLink: (s as any).linkUrl || null,
  }))

  const mappedAgenda = agenda.map(a => ({
    id: a.id, slug: (a as any).slug || a.id, title: (a as any).judul,
    date: (a as any).tanggalMulai, time: (a as any).waktu || '',
    location: (a as any).lokasi || '', category: (a as any).kategori || 'kegiatan',
    image: (a as any).gambarUrl || null,
  }))

  const mappedPengumuman = pengumuman.map(p => ({
    id: p.id, slug: (p as any).slug || p.id, title: (p as any).judul,
    date: (p as any).tanggal, summary: (p as any).ringkasan || '',
    priority: (p as any).prioritas || 'normal',
  }))

  const mappedPrestasi = prestasi.map(p => ({
    id: p.id, slug: (p as any).slug || p.id, title: (p as any).judul,
    date: (p as any).createdAt, level: (p as any).tingkat || 'SEKOLAH',
    category: (p as any).kategori || '', student: (p as any).siswa || '',
    achievement: (p as any).pencapaian || '', image: (p as any).gambarUrl || null,
  }))

  const mappedGurus = gurus.map(g => ({
    id: g.id, slug: (g as any).slug || g.id, name: (g as any).nama,
    photo: (g as any).foto || null, jabatan: (g as any).jabatan || '',
    jabatanLabel: (g as any).jabatanLabel || '', bidang: (g as any).bidang || '',
    pendidikan: (g as any).pendidikan || '', bio: (g as any).bio || '',
  }))

  const mappedBlogs = blogs.map(b => ({
    id: b.id, slug: (b as any).slug, title: (b as any).judul,
    date: (b as any).createdAt, excerpt: (b as any).ringkasan || '',
    author: (b as any).penulis || '', authorPhoto: (b as any).fotoPenulis || null,
    category: (b as any).kategori || '', image: (b as any).gambarUrl || null,
  }))

  const mappedFasilitas = fasilitas.map(f => ({
    id: f.id, slug: (f as any).slug || f.id, name: (f as any).nama,
    category: (f as any).kategori || '', capacity: (f as any).kapasitas || null,
    image: (f as any).gambarUrl || null,
  }))

  const mappedEkskul = ekskul.map(e => ({
    id: e.id, slug: (e as any).slug || e.id, name: (e as any).nama,
    category: (e as any).kategori || '', day: (e as any).hari || '',
    memberCount: (e as any).jumlahAnggota || 0, maxMembers: (e as any).maxAnggota || 0,
    registrationOpen: (e as any).pendaftaranBuka ?? true, image: (e as any).gambarUrl || null,
  }))

  return (
    <>
      <HeroSlider slides={mappedSlides as any} />
      <StatsCounter stats={stats} akreditasi={pengaturan.akreditasi || ''} />
      <AgendaSection agenda={mappedAgenda as any} />
      <PengumumanSection latestPengumuman={mappedPengumuman as any} />
      <PrestasiSection prestasi={mappedPrestasi as any} />
      <GuruSection gurus={mappedGurus as any} />
      <BlogSection blogs={mappedBlogs as any} />
      <TestimonialSection />
      <FasilitasSection fasilitas={mappedFasilitas as any} />
      <EkskulSection ekskul={mappedEkskul as any} />
      <CTASection />
    </>
  )
}
