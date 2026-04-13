import { readFile } from 'fs/promises'
import path from 'path'
import { headers } from 'next/headers'
import { getDemoHost } from '@/lib/runtime/app-context'

export const metadata = {
  title: 'SchoolPro — Platform Manajemen Sekolah All-in-One | Website, PPDB, Keuangan',
  description:
    'SchoolPro adalah platform manajemen sekolah berbasis web yang menggabungkan website sekolah, PPDB online, administrasi akademik, dan keuangan dalam satu sistem terpadu.',
}

function replaceAll(input: string, search: string, value: string) {
  return input.split(search).join(value)
}

async function getLandingMarkup(host: string) {
  const sourcePath = path.join(process.cwd(), 'src/features/marketing/lp-schoolpro/index.html')
  const html = await readFile(sourcePath, 'utf8')
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let markup = bodyMatch?.[1] || ''
  const demoUrl = `https://${getDemoHost(host)}`

  markup = replaceAll(markup, 'href="#" class="navbar-brand"', 'href="/" class="navbar-brand"')
  markup = replaceAll(markup, 'href="#harga" class="btn btn-primary btn-sm">Mulai Gratis</a>', 'href="/daftarkan-sekolah" class="btn btn-primary btn-sm">Daftarkan Sekolah</a>')
  markup = replaceAll(markup, 'href="#harga" class="btn btn-primary btn-lg btn-shimmer" id="cta-hero-primary"', 'href="/daftarkan-sekolah" class="btn btn-primary btn-lg btn-shimmer" id="cta-hero-primary"')
  markup = replaceAll(markup, 'href="#fitur" class="btn btn-outline btn-lg" id="cta-hero-demo"', `href="${demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg" id="cta-hero-demo"`)
  markup = replaceAll(markup, 'href="#" class="btn btn-outline" id="cta-starter">Mulai Gratis</a>', 'href="/daftarkan-sekolah" class="btn btn-outline" id="cta-starter">Daftarkan Sekolah</a>')
  markup = replaceAll(markup, 'href="#" class="btn btn-primary" id="cta-professional">Pilih Professional</a>', 'href="/daftarkan-sekolah" class="btn btn-primary" id="cta-professional">Ajukan Demo</a>')
  markup = replaceAll(markup, 'href="#harga" class="btn btn-primary btn-lg btn-shimmer" id="cta-final-primary"', 'href="/daftarkan-sekolah" class="btn btn-primary btn-lg btn-shimmer" id="cta-final-primary"')
  markup = replaceAll(markup, 'href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg" id="cta-final-wa"', 'href="/kontak" class="btn btn-outline btn-lg" id="cta-final-wa"')
  markup = replaceAll(markup, 'href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">Kontak</a>', 'href="/kontak">Kontak</a>')
  markup = replaceAll(markup, '<script src="js/main.js" defer></script>', '')

  return markup
}

export default async function LandingPage() {
  const host = (await headers()).get('host') || ''
  const markup = await getLandingMarkup(host)

  return <div dangerouslySetInnerHTML={{ __html: markup }} />
}
