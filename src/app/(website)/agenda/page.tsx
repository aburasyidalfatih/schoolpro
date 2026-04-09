import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, MapPin, User, CalendarClock } from 'lucide-react'
import styles from '@/components/website/page.module.css'
import agendaStyles from './page.module.css'

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export default async function AgendaPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const [mendatang, lewat] = await Promise.all([
    prisma.agenda.findMany({
      where: { tenantId: tenant.id, isPublished: true, tanggalMulai: { gte: new Date() } },
      orderBy: { tanggalMulai: 'asc' },
    }),
    prisma.agenda.findMany({
      where: { tenantId: tenant.id, isPublished: true, tanggalMulai: { lt: new Date() } },
      orderBy: { tanggalMulai: 'desc' },
      take: 10,
    }),
  ])

  const AgendaItem = ({ a }: { a: typeof mendatang[0] }) => (
    <div className={agendaStyles.agendaItem}>
      <div className={agendaStyles.agendaDateBox}>
        <div className={agendaStyles.agendaDay}>{new Date(a.tanggalMulai).getDate()}</div>
        <div className={agendaStyles.agendaMonth}>
          {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(a.tanggalMulai))}
        </div>
        <div className={agendaStyles.agendaYear}>{new Date(a.tanggalMulai).getFullYear()}</div>
      </div>
      <div className={agendaStyles.agendaContent}>
        <div className={agendaStyles.agendaTitle}>{a.judul}</div>
        <div className={agendaStyles.agendaMeta}>
          {a.lokasi && <span><MapPin size={12} /> {a.lokasi}</span>}
          {a.penanggungjawab && <span><User size={12} /> {a.penanggungjawab}</span>}
          {a.tanggalAkhir && <span><CalendarClock size={12} /> s/d {formatTanggal(a.tanggalAkhir)}</span>}
        </div>
        {a.deskripsi && <div className={agendaStyles.agendaDesc}>{a.deskripsi}</div>}
      </div>
    </div>
  )

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Agenda</span></div>
          <div className={styles.pageLabel}><Calendar size={13} /> Jadwal Kegiatan</div>
          <h1 className={styles.pageTitle}>Agenda Pesantren</h1>
          <p className={styles.pageSubtitle}>Jadwal kegiatan akademik dan non-akademik</p>
        </div>
      </div>
      <div className={styles.container}>
        {mendatang.length === 0 && lewat.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Calendar size={28} /></div>
            <div className={styles.emptyText}>Belum ada agenda</div>
          </div>
        ) : (
          <>
            {mendatang.length > 0 && (
              <div className={agendaStyles.agendaSection}>
                <div className={agendaStyles.agendaSectionTitle}>
                  <Calendar size={18} /> Agenda Mendatang
                </div>
                {mendatang.map(a => <AgendaItem key={a.id} a={a} />)}
              </div>
            )}
            {lewat.length > 0 && (
              <div className={agendaStyles.agendaSection}>
                <div className={agendaStyles.agendaSectionTitlePast}>
                  <CalendarClock size={18} /> Agenda Sebelumnya
                </div>
                {lewat.map(a => <AgendaItem key={a.id} a={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
