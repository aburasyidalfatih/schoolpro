import Link from 'next/link'
import { BookOpen, MapPin, Phone, Mail, Globe, Share2, MessageCircle, Play, AtSign, ChevronRight } from 'lucide-react'
import styles from './WebsiteLayout.module.css'

interface Props {
  tenant: { nama: string; logoUrl?: string | null; alamat?: string | null; telepon?: string | null; email?: string | null; website?: string | null; mediaSosial?: any; profileWebsite?: any }
}

export default function WebsiteFooter({ tenant }: Props) {
  const sosmed = (tenant.mediaSosial as any) || {}
  const profile = (tenant.profileWebsite as any) || {}

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoBox}>
            {tenant.logoUrl
              ? <img src={tenant.logoUrl} alt={tenant.nama} style={{ width: 26, height: 26, objectFit: 'contain' }} />
              : <BookOpen size={22} />
            }
          </div>
          <div className={styles.footerBrandName}>{tenant.nama}</div>
          <div className={styles.footerBrandSub}>{profile.tipeLembaga || 'Lembaga Pendidikan'}</div>
          <p className={styles.footerDesc}>
            {profile.deskripsiSingkat || `${tenant.nama} berkomitmen memberikan pendidikan berkualitas untuk generasi masa depan.`}
          </p>
          <div className={styles.footerSocial}>
            {sosmed.instagram && <a href={sosmed.instagram} className={styles.footerSocialLink} target="_blank" rel="noopener" aria-label="Instagram"><AtSign size={16} /></a>}
            {sosmed.facebook && <a href={sosmed.facebook} className={styles.footerSocialLink} target="_blank" rel="noopener" aria-label="Facebook"><Share2 size={16} /></a>}
            {sosmed.youtube && <a href={sosmed.youtube} className={styles.footerSocialLink} target="_blank" rel="noopener" aria-label="YouTube"><Play size={16} /></a>}
            {sosmed.twitter && <a href={sosmed.twitter} className={styles.footerSocialLink} target="_blank" rel="noopener" aria-label="Twitter"><MessageCircle size={16} /></a>}
          </div>
        </div>

        <div className={styles.footerCol}>
          <h4>Navigasi</h4>
          <ul className={styles.footerLinks}>
            {[['/', 'Beranda'], ['/profil', 'Profil Sekolah'], ['/berita', 'Berita'], ['/pengumuman', 'Pengumuman'], ['/agenda', 'Agenda']].map(([href, label]) => (
              <li key={href}><Link href={href}><ChevronRight size={12} />{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h4>Program</h4>
          <ul className={styles.footerLinks}>
            {[['/ekskul', 'Ekstrakurikuler'], ['/fasilitas', 'Fasilitas'], ['/prestasi', 'Prestasi'], ['/alumni', 'Alumni'], ['/ppdb', 'PPDB Online']].map(([href, label]) => (
              <li key={href}><Link href={href}><ChevronRight size={12} />{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h4>Kontak</h4>
          {tenant.alamat && (
            <div className={styles.footerContactItem}>
              <div className={styles.footerContactIcon}><MapPin size={14} /></div>
              <div className={styles.footerContactText}>{tenant.alamat}</div>
            </div>
          )}
          {tenant.telepon && (
            <div className={styles.footerContactItem}>
              <div className={styles.footerContactIcon}><Phone size={14} /></div>
              <div className={styles.footerContactText}><a href={`tel:${tenant.telepon}`}>{tenant.telepon}</a></div>
            </div>
          )}
          {tenant.email && (
            <div className={styles.footerContactItem}>
              <div className={styles.footerContactIcon}><Mail size={14} /></div>
              <div className={styles.footerContactText}><a href={`mailto:${tenant.email}`}>{tenant.email}</a></div>
            </div>
          )}
          {tenant.website && (
            <div className={styles.footerContactItem}>
              <div className={styles.footerContactIcon}><Globe size={14} /></div>
              <div className={styles.footerContactText}><a href={tenant.website} target="_blank" rel="noopener">{tenant.website}</a></div>
            </div>
          )}
        </div>
      </div>

      <hr className={styles.footerDivider} />
      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} {tenant.nama}. Hak cipta dilindungi.</span>
        <span>Powered by <span className={styles.footerBottomBrand}>SISPRO</span></span>
      </div>
    </footer>
  )
}
