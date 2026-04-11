import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

const TTL = 60 // 60 detik

export const getWebsiteHomeData = (tenantId: string) =>
  unstable_cache(
    async () => {
      const [slides, pengumuman, agenda, prestasi, gurus, blogs, fasilitas, ekskul] =
        await Promise.all([
          prisma.slider.findMany({ where: { tenantId, isActive: true }, orderBy: { urutan: 'asc' } }),
          prisma.pengumuman.findMany({ where: { tenantId }, orderBy: { tanggal: 'desc' }, take: 4 }),
          prisma.agenda.findMany({ where: { tenantId, isPublished: true }, orderBy: { tanggalMulai: 'asc' }, take: 6 }),
          prisma.prestasi.findMany({ where: { tenantId, isPublished: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
          prisma.guru.findMany({ where: { tenantId }, orderBy: { urutan: 'asc' }, take: 10 }),
          prisma.blog.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 3 }),
          prisma.fasilitas.findMany({ where: { tenantId, isPublished: true }, orderBy: { createdAt: 'desc' }, take: 4 }),
          prisma.ekskul.findMany({ where: { tenantId, isActive: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
        ])
      return { slides, pengumuman, agenda, prestasi, gurus, blogs, fasilitas, ekskul }
    },
    [`home-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `home-${tenantId}`] }
  )()

export const getWebsiteAgenda = (tenantId: string) =>
  unstable_cache(
    async () => prisma.agenda.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { tanggalMulai: 'asc' },
    }),
    [`agenda-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `agenda-${tenantId}`] }
  )()

export const getWebsitePengumuman = (tenantId: string) =>
  unstable_cache(
    async () => prisma.pengumuman.findMany({
      where: { tenantId },
      orderBy: { tanggal: 'desc' },
    }),
    [`pengumuman-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `pengumuman-${tenantId}`] }
  )()

export const getWebsitePrestasi = (tenantId: string) =>
  unstable_cache(
    async () => prisma.prestasi.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    }),
    [`prestasi-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `prestasi-${tenantId}`] }
  )()

export const getWebsiteGuru = (tenantId: string) =>
  unstable_cache(
    async () => prisma.guru.findMany({
      where: { tenantId },
      orderBy: { urutan: 'asc' },
    }),
    [`guru-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `guru-${tenantId}`] }
  )()

export const getWebsiteBlog = (tenantId: string) =>
  unstable_cache(
    async () => prisma.blog.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    }),
    [`blog-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `blog-${tenantId}`] }
  )()

export const getWebsiteBlogBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.blog.findFirst({ where: { tenantId, slug } }),
    [`blog-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `blog-${tenantId}`] }
  )()

export const getWebsiteEditorial = (tenantId: string) =>
  unstable_cache(
    async () => prisma.editorial.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    }),
    [`editorial-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `editorial-${tenantId}`] }
  )()

export const getWebsiteEditorialBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.editorial.findFirst({ where: { tenantId, slug } }),
    [`editorial-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `editorial-${tenantId}`] }
  )()

export const getWebsiteEkskul = (tenantId: string) =>
  unstable_cache(
    async () => prisma.ekskul.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    [`ekskul-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `ekskul-${tenantId}`] }
  )()

export const getWebsiteEkskulBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.ekskul.findFirst({ where: { tenantId, slug } }),
    [`ekskul-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `ekskul-${tenantId}`] }
  )()

export const getWebsiteFasilitas = (tenantId: string) =>
  unstable_cache(
    async () => prisma.fasilitas.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { createdAt: 'desc' },
    }),
    [`fasilitas-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `fasilitas-${tenantId}`] }
  )()

export const getWebsiteFasilitasBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.fasilitas.findFirst({ where: { tenantId, slug } }),
    [`fasilitas-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `fasilitas-${tenantId}`] }
  )()

export const getWebsitePrestasiBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.prestasi.findFirst({ where: { tenantId, slug } }),
    [`prestasi-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `prestasi-${tenantId}`] }
  )()

export const getWebsiteAgendaBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.agenda.findFirst({ where: { tenantId, slug } }),
    [`agenda-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `agenda-${tenantId}`] }
  )()

export const getWebsitePengumumanBySlug = (tenantId: string, slug: string) =>
  unstable_cache(
    async () => prisma.pengumuman.findFirst({ where: { tenantId, slug } }),
    [`pengumuman-slug-${tenantId}-${slug}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`, `pengumuman-${tenantId}`] }
  )()

export const getWebsiteLayoutData = (tenantId: string) =>
  unstable_cache(
    async () => {
      const [latestPengumuman, latestAgenda] = await Promise.all([
        prisma.pengumuman.findFirst({ where: { tenantId }, orderBy: { tanggal: 'desc' } }),
        prisma.agenda.findFirst({ where: { tenantId, isPublished: true }, orderBy: { tanggalMulai: 'asc' } }),
      ])
      return { latestPengumuman, latestAgenda }
    },
    [`layout-${tenantId}`],
    { revalidate: TTL, tags: [`tenant-${tenantId}`] }
  )()
