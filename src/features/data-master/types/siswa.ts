export type TabType = 'profil' | 'kontak' | 'orangtua' | 'akademik'

export type StudentQuota = {
  activeStudents: number
  studentCapacity: number
  remainingSlots: number
  usagePercent: number
  warningLevel: 'NONE' | 'NORMAL' | 'WARNING_80' | 'WARNING_90' | 'FULL'
} | null

export type UnitOption = {
  id: string
  nama: string
}

export type KelasOption = {
  id: string
  nama: string
}

export type PaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type SiswaRow = {
  id: string
  nis: string
  nisn?: string | null
  namaLengkap: string
  jenisKelamin?: string | null
  tempatLahir?: string | null
  tanggalLahir?: string | null
  alamat?: string | null
  telepon?: string | null
  fotoUrl?: string | null
  namaWali?: string | null
  teleponWali?: string | null
  emailWali?: string | null
  kelasId?: string | null
  unitId?: string | null
  status: string
  kelas?: { nama?: string | null } | null
  unit?: { nama?: string | null } | null
}

export type SiswaFormData = {
  nis: string
  nisn: string
  namaLengkap: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  alamat: string
  telepon: string
  fotoUrl: string
  namaWali: string
  teleponWali: string
  emailWali: string
  kelasId: string
  unitId: string
  status: string
}
