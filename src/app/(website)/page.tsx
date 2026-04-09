import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, BookOpen, Calendar, Trophy, Star, ArrowRight, Newspaper, Bell, Clock, MapPin, GraduationCap, ChevronRight } from 'lucide-react'
import styles from './page.module.css'

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
}

const tingkatColor: Record<string, { bg: string; color: string }> = {
  SEKOLAH:       { bg: '#f1f5f9', color: '#475569' },
  KOTA:          { bg: '#eff6ff', color: '#2563eb' },
  PROVINSI:      { bg: '#f5f3ff', color: '#7c3aed' },
  NASIONAL:      { bg: '#fef3c7', color: '#d97706' },
  INTERNASIONAL: { bg: '#fef2f2', color: '#dc2626' },
}

const kategoriLabel: Record<string, string> = {
  BERITA: 'Berita', EDITORIAL: 'Editorial', BLOG_GURU: 'Blog Guru'
}

export default async function BerandaPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const profile = (tenant.profileWebsite as any) || {}

  const [beritas, pengumumans, agendas, prestasis, ekskuls, ppdbAktif] = await Promise.all([
    prisma.berita.findMany({ where: { tenantId: tenant.id, status: 'TERBIT' }, orderBy: { tanggalTerbit: 'desc' }, take: 3 }),
    prisma.pengumuman.findMany({ where: { tenantId: tenant.id }, orderBy: { tanggal: 'desc' }, take: 5 }),
    prisma.agenda.findMany({ where: { tenantId: tenant.id, isPublished: true, tanggalMulai: { gte: new Date() } }, orderBy: { tanggalMulai: 'asc' }, take: 5 }),
    prisma.prestasi.findMany({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { tahun: 'desc' }, take: 6 }),
    prisma.ekskul.findMany({ where: { tenantId: tenant.id, isActive: true }, take: 8 }),
    prisma.periodePpdb.findFirst({ where: { tenantId: tenant.id, isActive: true, tanggalBuka: { lte: new Date() }, tanggalTutup: { gte: new Date() } } }),
  ])

  const stats = profile.stats || {}

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <BookOpen size={12} />
              {profile.tipeLembaga || 'Lembaga Pendidikan Islam'}
            </div>
            <h1 className={styles.heroTitle}>
              {profile.heroJudul
                ? <>{profile.heroJudul}</>
                : <>{tenant.nama}</>
              }
            </h1>
            <p className={styles.heroDesc}>
              {profile.heroSubjudul || 'Membentuk generasi yang berilmu, berakhlak mulia, dan bermanfaat bagi umat dan bangsa.'}
            </p>
            <div className={styles.heroActions}>
              <Link href="/profil" className={styles.btnHeroPrimary}>
                Profil Kami <ArrowRight size={16} />
              </Link>
              {ppdbAktif
                ? <Link href="/ppdb" className={styles.btnHeroSecondary}><GraduationCap size={16} /> Daftar Sekarang</Link>
                : <Link href="/berita" className={styles.btnHeroSecondary}><Newspaper size={16} /> Lihat Berita</Link>
              }
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardTitle}>Sekilas Tentang Kami</div>
              <div className={styles.heroStatGrid}>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNum}>{stats.siswa || '1.200'}+</div>
                  <div className={styles.heroStatLabel}>Santri/Siswa</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNum}>{stats.guru || '85'}+</div>
                  <div className={styles.heroStatLabel}>Tenaga Pendidik</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNum}>{stats.tahunBerdiri || '1952'}</div>
                  <div className={styles.heroStatLabel}>Tahun Berdiri</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatNum}>{stats.prestasi || '200'}+</div>
                  <div className={styles.heroStatLabel}>Prestasi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className={styles.statsBar}>
        <div className={styles.statsBarInner}>
          {[
            { icon: <Users size={22} />, num: `${stats.siswa || '1.200'}+`, label: 'Santri Aktif' },
            { icon: <BookOpen size={22} />, num: `${stats.guru || '85'}+`, label: 'Tenaga Pendidik' },
            { icon: <Calendar size={22} />, num: stats.tahunBerdiri || '1952', label: 'Tahun Berdiri' },
            { icon: <Trophy size={22} />, num: `${stats.prestasi || '200'}+`, label: 'Prestasi Diraih' },
          ].map((s, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statText}>
                <div className={styles.statNumber}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Berita ── */}
      {beritas.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}><Newspaper size={13} /> Informasi Terkini</div>
              <h2 className={styles.sectionTitle}>Berita & Artikel</h2>
              <p className={styles.sectionSubtitle}>Kabar terbaru dari lingkungan pesantren</p>
            </div>
            <Link href="/berita" className={styles.seeAll}>Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div className={styles.beritaGrid}>
            {beritas.map(b => (
              <Link key={b.id} href={`/berita/${b.slug}`} className={styles.beritaCard}>
                <div className={styles.beritaImg}>
                  {b.gambarUrl
                    ? <img src={b.gambarUrl} alt={b.judul} />
                    : <div className={styles.beritaImgPlaceholder}><Newspaper size={40} /></div>
                  }
                </div>
                <div className={styles.beritaBody}>
                  <span className={styles.beritaKategori}>{kategoriLabel[b.kategori] || b.kategori}</span>
                  <div className={styles.beritaJudul}>{b.judul}</div>
                  {b.ringkasan && <div className={styles.beritaRingkasan}>{b.ringkasan}</div>}
                  <div className={styles.beritaMeta}>
                    <Clock size={12} />
                    {formatTanggal(b.tanggalTerbit || b.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Pengumuman + Agenda ── */}
      <div className={styles.sectionAlt}>
        <div className={styles.sectionAltInner}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}><Bell size={13} /> Informasi Sekolah</div>
              <h2 className={styles.sectionTitle}>Pengumuman & Agenda</h2>
              <p className={styles.sectionSubtitle}>Informasi resmi dan jadwal kegiatan terkini</p>
            </div>
          </div>
          <div className={styles.infoGrid}>
            {/* Pengumuman */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.infoCardTitleWrap}>
                  <div className={styles.infoCardIcon}><Bell size={16} /></div>
                  <span className={styles.infoCardTitle}>Pengumuman</span>
                </div>
                <Link href="/pengumuman" className={styles.infoCardLink}>Semua <ChevronRight size={13} /></Link>
              </div>
              <div className={styles.infoList}>
                {pengumumans.length === 0
                  ? <div className={styles.infoEmpty}>Belum ada pengumuman</div>
                  : pengumumans.map(p => (
                    <div key={p.id} className={styles.infoItem}>
                      <div className={styles.infoItemTitle}>{p.judul}</div>
                      <div className={styles.infoItemMeta}><Clock size={11} />{formatTanggal(p.tanggal)}</div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Agenda */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.infoCardTitleWrap}>
                  <div className={styles.infoCardIcon}><Calendar size={16} /></div>
                  <span className={styles.infoCardTitle}>Agenda Mendatang</span>
                </div>
                <Link href="/agenda" className={styles.infoCardLink}>Semua <ChevronRight size={13} /></Link>
              </div>
              <div className={styles.infoList}>
                {agendas.length === 0
                  ? <div className={styles.infoEmpty}>Belum ada agenda</div>
                  : agendas.map(a => (
                    <div key={a.id} className={styles.infoItem}>
                      <div className={styles.agendaDate}>
                        <div className={styles.agendaDateBox}>
                          <div className={styles.agendaDay}>{new Date(a.tanggalMulai).getDate()}</div>
                          <div className={styles.agendaMonth}>{new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(a.tanggalMulai))}</div>
                        </div>
                        <div>
                          <div className={styles.infoItemTitle}>{a.judul}</div>
                          {a.lokasi && <div className={styles.infoItemMeta}><MapPin size={11} />{a.lokasi}</div>}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Prestasi ── */}
      {prestasis.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionLabel}><Trophy size={13} /> Capaian Kami</div>
              <h2 className={styles.sectionTitle}>Prestasi Unggulan</h2>
              <p className={styles.sectionSubtitle}>Pencapaian membanggakan warga pesantren</p>
            </div>
            <Link href="/prestasi" className={styles.seeAll}>Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div className={styles.prestasiGrid}>
            {prestasis.map(p => {
              const tc = tingkatColor[p.tingkat] || tingkatColor.SEKOLAH
              return (
                <div key={p.id} className={styles.prestasiCard}>
                  <div className={styles.prestasiIconWrap}><Trophy size={22} /></div>
                  <div className={styles.prestasiTingkat} style={{ background: tc.bg, color: tc.color }}>
                    {p.tingkat}
                  </div>
                  <div className={styles.prestasiJudul}>{p.judul}</div>
                  <div className={styles.prestasiTahun}>{p.tahun}</div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Ekskul ── */}
      {ekskuls.length > 0 && (
        <div className={styles.sectionAlt}>
          <div className={styles.sectionAltInner}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionLabel}><Star size={13} /> Kegiatan</div>
                <h2 className={styles.sectionTitle}>Program & Kegiatan</h2>
                <p className={styles.sectionSubtitle}>Kembangkan potensi diri bersama kami</p>
              </div>
              <Link href="/ekskul" className={styles.seeAll}>Lihat Semua <ArrowRight size={14} /></Link>
            </div>
            <div className={styles.ekskulGrid}>
              {ekskuls.map(e => (
                <div key={e.id} className={styles.ekskulCard}>
                  <div className={styles.ekskulIconWrap}><Star size={18} /></div>
                  <div className={styles.ekskulNama}>{e.nama}</div>
                  {e.jadwal && <div className={styles.ekskulJadwal}><Clock size={11} />{e.jadwal}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PPDB Banner ── */}
      {ppdbAktif && (
        <div className={styles.ppdbBanner}>
          <div className={styles.ppdbBannerInner}>
            <div>
              <div className={styles.ppdbBannerLabel}><GraduationCap size={13} /> Penerimaan Peserta Didik Baru</div>
              <h2 className={styles.ppdbBannerTitle}>Pendaftaran Santri Baru Dibuka</h2>
              <p className={styles.ppdbBannerDesc}>Bergabunglah bersama kami. Kuota terbatas, segera daftarkan putra-putri Anda.</p>
            </div>
            <Link href="/ppdb" className={styles.btnPpdbBanner}>
              Daftar Sekarang <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
