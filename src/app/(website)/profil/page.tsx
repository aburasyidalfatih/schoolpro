import { headers } from 'next/headers'
import { getTenantBySlug } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, MapPin, Phone, Mail, Globe, Award, Calendar, Target, Rocket, UserCircle, AtSign, Share2, Play, MessageCircle } from 'lucide-react'
import styles from './page.module.css'

export default async function ProfilPage() {
  const headerList = await headers()
  const tenantSlug = headerList.get('x-tenant-slug') || 'demo'
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) redirect('/app/login')

  const profile = (tenant.profileWebsite as any) || {}
  const sosmed = (tenant.mediaSosial as any) || {}

  return (
    <>
      <div className={styles.pageHero}>
        <div className={styles.pageHeroInner}>
          <div className={styles.breadcrumb}><Link href="/">Beranda</Link> <span>/</span> <span>Profil</span></div>
          <div className={styles.pageLabel}><BookOpen size={13} /> Tentang Kami</div>
          <h1 className={styles.pageTitle}>Profil Pesantren</h1>
          <p className={styles.pageSubtitle}>Mengenal lebih dekat {tenant.nama}</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.profilGrid}>
          <div className={styles.profilMain}>
            {/* Identity card */}
            <div className={styles.profilCard}>
              <div className={styles.profilLogoBox}>
                {tenant.logoUrl
                  ? <img src={tenant.logoUrl} alt={tenant.nama} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                  : <BookOpen size={40} />
                }
              </div>
              <h2 className={styles.profilNama}>{tenant.nama}</h2>
              {profile.tipeLembaga && <div className={styles.profilTipe}>{profile.tipeLembaga}</div>}
              <div className={styles.profilBadges}>
                {profile.npsn && <span className={styles.profilBadge}>NPSN: {profile.npsn}</span>}
                {profile.akreditasi && <span className={styles.profilBadgeGreen}>Akreditasi {profile.akreditasi}</span>}
                {profile.tahunBerdiri && <span className={styles.profilBadge}>Est. {profile.tahunBerdiri}</span>}
              </div>
            </div>

            {/* Tentang */}
            {profile.tentang && (
              <div className={styles.profilSection}>
                <h3 className={styles.profilSectionTitle}><BookOpen size={16} /> Tentang Pesantren</h3>
                <div className={styles.profilText}>{profile.tentang}</div>
              </div>
            )}

            {/* Visi Misi */}
            {(profile.visi || profile.misi) && (
              <div className={styles.profilVisiMisi}>
                {profile.visi && (
                  <div className={styles.profilVisiCard}>
                    <div className={styles.profilVisiIcon}><Target size={20} /></div>
                    <h3>Visi</h3>
                    <p>{profile.visi}</p>
                  </div>
                )}
                {profile.misi && (
                  <div className={styles.profilMisiCard}>
                    <div className={styles.profilMisiIcon}><Rocket size={20} /></div>
                    <h3>Misi</h3>
                    <div className={styles.profilText} style={{ whiteSpace: 'pre-line' }}>{profile.misi}</div>
                  </div>
                )}
              </div>
            )}

            {/* Kepala Sekolah */}
            {profile.kepalaSekolah && (
              <div className={styles.profilSection}>
                <h3 className={styles.profilSectionTitle}><UserCircle size={16} /> Pimpinan</h3>
                <div className={styles.kepalaCard}>
                  <div className={styles.kepalaFoto}>
                    {profile.fotoKepala
                      ? <img src={profile.fotoKepala} alt={profile.kepalaSekolah} />
                      : <UserCircle size={32} />
                    }
                  </div>
                  <div>
                    <div className={styles.kepalaNama}>{profile.kepalaSekolah}</div>
                    <div className={styles.kepalaJabatan}>Pengasuh / Kepala Sekolah</div>
                    {profile.nipKepala && <div className={styles.kepalaNip}>NIP: {profile.nipKepala}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={styles.profilSidebar}>
            <div className={styles.infoBox}>
              <h3 className={styles.infoBoxTitle}>Informasi Kontak</h3>
              <div className={styles.infoList}>
                {tenant.alamat && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><MapPin size={14} /></div>
                    <span>{tenant.alamat}</span>
                  </div>
                )}
                {tenant.telepon && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><Phone size={14} /></div>
                    <a href={`tel:${tenant.telepon}`}>{tenant.telepon}</a>
                  </div>
                )}
                {tenant.email && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><Mail size={14} /></div>
                    <a href={`mailto:${tenant.email}`}>{tenant.email}</a>
                  </div>
                )}
                {tenant.website && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><Globe size={14} /></div>
                    <a href={tenant.website} target="_blank" rel="noopener">{tenant.website}</a>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoBox}>
              <h3 className={styles.infoBoxTitle}>Data Lembaga</h3>
              <div className={styles.infoList}>
                {profile.npsn && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><BookOpen size={14} /></div>
                    <span>NPSN: <strong>{profile.npsn}</strong></span>
                  </div>
                )}
                {profile.akreditasi && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><Award size={14} /></div>
                    <span>Akreditasi: <strong>{profile.akreditasi}</strong></span>
                  </div>
                )}
                {profile.tahunBerdiri && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoRowIcon}><Calendar size={14} /></div>
                    <span>Berdiri: <strong>{profile.tahunBerdiri}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {(sosmed.instagram || sosmed.facebook || sosmed.youtube || sosmed.twitter) && (
              <div className={styles.infoBox}>
                <h3 className={styles.infoBoxTitle}>Media Sosial</h3>
                <div className={styles.sosmedList}>
                  {sosmed.instagram && <a href={sosmed.instagram} target="_blank" rel="noopener" className={styles.sosmedItem}><AtSign size={15} /> Instagram</a>}
                  {sosmed.facebook && <a href={sosmed.facebook} target="_blank" rel="noopener" className={styles.sosmedItem}><Share2 size={15} /> Facebook</a>}
                  {sosmed.youtube && <a href={sosmed.youtube} target="_blank" rel="noopener" className={styles.sosmedItem}><Play size={15} /> YouTube</a>}
                  {sosmed.twitter && <a href={sosmed.twitter} target="_blank" rel="noopener" className={styles.sosmedItem}><MessageCircle size={15} /> Twitter/X</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
