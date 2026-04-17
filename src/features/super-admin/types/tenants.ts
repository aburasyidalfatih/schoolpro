export type TenantRow = {
  id: string
  nama: string
  slug: string
  email: string | null
  telepon: string | null
  paket: string
  planId: string | null
  planName: string
  isActive: boolean
  tenantStatus: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'ARCHIVED'
  berlanggananSampai: string | null
  trialEndsAt: string | null
  status: 'ACTIVE' | 'TRIAL' | 'FREE' | 'SUSPENDED' | 'EXPIRED' | 'ARCHIVED'
  subscriptionStatus: string | null
  studentCapacity: number
  subscriptionStartsAt: string | null
  subscriptionEndsAt: string | null
  owner: {
    id: string
    nama: string
    email: string
    username: string
  } | null
  stats: {
    users: number
    siswas: number
    tagihans: number
  }
  overridesCount: number
}

export type TenantSummary = {
  total: number
  active: number
  free: number
  trial: number
  suspended: number
  expiringSoon: number
}

export type TenantPaginationState = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PlanOption = {
  id: string
  code: string
  name: string
  studentCapacity: number
}

export type TenantFormData = {
  nama: string
  email: string
  telepon: string
  paket: string
  planId: string
  tenantStatus: string
  isActive: boolean
  berlanggananSampai: string
  trialEndsAt: string
}
