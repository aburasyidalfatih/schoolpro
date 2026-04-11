// ============================================
// Types for Pesantren Putri Syech Ahmad Khatib
// ============================================

export type SkinType = 'akademi' | 'mading' | 'prestasi' | 'emerald' | 'sunset' | 'midnight';

export interface SlideItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
  ctaLink?: string;
}

export interface AgendaItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  penanggungJawab: string;
  contactPerson: string;
  description: string;
  category: 'ujian' | 'rapat' | 'libur' | 'kegiatan' | 'lainnya';
  image?: string;
}

export interface PengumumanItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  priority: 'urgent' | 'normal' | 'info';
  image?: string;
}

export interface EditorialItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  author: string;
  authorPhoto: string;
  authorTitle: string;
  image?: string;
}

export interface BlogItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  author: string;
  authorPhoto: string;
  authorBio: string;
  category: string;
  tags: string[];
  image?: string;
}

export interface PrestasiItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  level: 'kota' | 'provinsi' | 'nasional' | 'internasional';
  category: string;
  student: string;
  achievement: string;
  images: string[];
  image?: string;
}

export interface FasilitasItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  capacity?: string;
  features: string[];
  images: string[];
  image?: string;
}

export interface EkskulItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  schedule: string;
  day: string;
  instructor: string;
  memberCount: number;
  maxMembers: number;
  category: string;
  registrationOpen: boolean;
  image?: string;
  images: string[];
}

export interface SchoolInfo {
  name: string;
  shortName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  visi: string;
  misi: string[];
  sejarah: string;
  akreditasi: string;
  npsn: string;
  stats: {
    students: number;
    teachers: number;
    achievements: number;
    extracurriculars: number;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
  };
}

export interface RunningTextItem {
  id: number;
  text: string;
  type: 'info' | 'urgent' | 'event';
}

export type GuruJabatan = 'kepala-pesantren' | 'wakil' | 'guru' | 'pembina-asrama';

export interface GuruItem {
  id: number;
  slug: string;
  name: string;
  jabatan: GuruJabatan;
  jabatanLabel: string;
  nip?: string;
  pendidikan: string;
  bidang: string;
  bio: string;
  quote?: string;
  photo: string;
  order: number;
}
