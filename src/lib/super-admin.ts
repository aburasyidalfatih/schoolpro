import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export type FeatureKey =
  | 'website'
  | 'cms'
  | 'ppdb'
  | 'keuangan'
  | 'tabungan'
  | 'laporan'
  | 'ai_module'
  | 'whatsapp_notifikasi'

export type FeatureOverrideState = 'DEFAULT' | 'ENABLED' | 'DISABLED'

export const availableFeatures: Array<{
  key: FeatureKey
  label: string
  description: string
}> = [
  { key: 'website', label: 'Website Sekolah', description: 'Website publik dan skin sekolah.' },
  { key: 'cms', label: 'CMS Konten', description: 'Berita, pengumuman, agenda, blog, dan editorial.' },
  { key: 'ppdb', label: 'PPDB', description: 'Periode, pendaftar, verifikasi, dan tagihan PPDB.' },
  { key: 'keuangan', label: 'Keuangan', description: 'Tagihan, pembayaran, rekening, dan arus kas.' },
  { key: 'tabungan', label: 'Tabungan', description: 'Saldo dan mutasi tabungan siswa.' },
  { key: 'laporan', label: 'Laporan', description: 'Export dan rekap operasional tenant.' },
  { key: 'ai_module', label: 'AI Module', description: 'Fitur AI untuk asistensi operasional dan konten.' },
  { key: 'whatsapp_notifikasi', label: 'WhatsApp Notifikasi', description: 'Reminder dan notifikasi WhatsApp.' },
]

export const defaultPlans: Array<{
  code: string
  name: string
  description: string
  price: Prisma.Decimal | number
  studentCapacity: number
  billingPeriod: string
  isDefault: boolean
  isPublic: boolean
  fullAccess: boolean
  sortOrder: number
  features: FeatureKey[]
}> = [
  {
    code: 'FREE',
    name: 'Free',
    description: 'Website sekolah dan CMS konten publik.',
    price: 0,
    studentCapacity: 0,
    billingPeriod: 'YEARLY',
    isDefault: true,
    isPublic: true,
    fullAccess: false,
    sortOrder: 1,
    features: ['website', 'cms'],
  },
  {
    code: 'SCH_50',
    name: 'SchoolPro 50',
    description: 'Full fitur SchoolPro untuk sekolah dengan kapasitas hingga 50 siswa aktif.',
    price: 1500000,
    studentCapacity: 50,
    billingPeriod: 'YEARLY',
    isDefault: false,
    isPublic: true,
    fullAccess: true,
    sortOrder: 2,
    features: availableFeatures.map((feature) => feature.key),
  },
  {
    code: 'SCH_100',
    name: 'SchoolPro 100',
    description: 'Full fitur SchoolPro untuk sekolah dengan kapasitas hingga 100 siswa aktif.',
    price: 2800000,
    studentCapacity: 100,
    billingPeriod: 'YEARLY',
    isDefault: false,
    isPublic: true,
    fullAccess: true,
    sortOrder: 3,
    features: availableFeatures.map((feature) => feature.key),
  },
  {
    code: 'SCH_300',
    name: 'SchoolPro 300',
    description: 'Full fitur SchoolPro untuk sekolah dengan kapasitas hingga 300 siswa aktif.',
    price: 7500000,
    studentCapacity: 300,
    billingPeriod: 'YEARLY',
    isDefault: false,
    isPublic: true,
    fullAccess: true,
    sortOrder: 4,
    features: availableFeatures.map((feature) => feature.key),
  },
  {
    code: 'SCH_500',
    name: 'SchoolPro 500',
    description: 'Full fitur SchoolPro untuk sekolah dengan kapasitas hingga 500 siswa aktif.',
    price: 11500000,
    studentCapacity: 500,
    billingPeriod: 'YEARLY',
    isDefault: false,
    isPublic: true,
    fullAccess: true,
    sortOrder: 5,
    features: availableFeatures.map((feature) => feature.key),
  },
  {
    code: 'SCH_1000',
    name: 'SchoolPro 1000',
    description: 'Full fitur SchoolPro untuk sekolah dengan kapasitas hingga 1000 siswa aktif.',
    price: 20000000,
    studentCapacity: 1000,
    billingPeriod: 'YEARLY',
    isDefault: false,
    isPublic: true,
    fullAccess: true,
    sortOrder: 6,
    features: availableFeatures.map((feature) => feature.key),
  },
]

export async function ensureDefaultPlans() {
  const count = await prisma.plan.count()
  if (count > 0) return

  for (const [index, plan] of defaultPlans.entries()) {
    await prisma.plan.create({
      data: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        price: new Prisma.Decimal(plan.price),
        studentCapacity: plan.studentCapacity,
        billingPeriod: plan.billingPeriod,
        isDefault: plan.isDefault,
        isActive: true,
        isPublic: plan.isPublic,
        fullAccess: plan.fullAccess,
        sortOrder: plan.sortOrder || index + 1,
        features: {
          create: plan.features.map((featureKey) => ({
            featureKey,
            isEnabled: true,
          })),
        },
      },
    })
  }
}

type SessionLike = {
  user?: object | null
} | null | undefined

export function isSuperAdmin(session: SessionLike) {
  if (!session?.user || typeof session.user !== 'object') return false
  return 'role' in session.user && session.user.role === 'SUPER_ADMIN'
}

export function resolveTenantStatus(tenant: {
  isActive: boolean
  paket: string
  tenantStatus?: string | null
  berlanggananSampai: Date | null
  trialEndsAt?: Date | null
}) {
  if (!tenant.isActive) return 'SUSPENDED'
  if (tenant.tenantStatus === 'ARCHIVED') return 'ARCHIVED'
  if (tenant.tenantStatus === 'TRIAL') {
    if (tenant.trialEndsAt && tenant.trialEndsAt < new Date()) return 'EXPIRED'
    return 'TRIAL'
  }
  if (tenant.berlanggananSampai && tenant.berlanggananSampai < new Date()) return 'EXPIRED'
  if (tenant.paket === 'FREE' && !tenant.berlanggananSampai) return 'FREE'
  return tenant.tenantStatus || 'ACTIVE'
}

type TenantSubscriptionSnapshot = {
  status: string
  studentCapacity: number
  startsAt: Date
  endsAt: Date | null
  activatedAt: Date | null
  lastPaidAt: Date | null
}

export function buildTenantSubscriptionSnapshot(input: {
  tenantStatus?: string | null
  isActive: boolean
  packageCode: string
  studentCapacity: number
  createdAt?: Date | null
  updatedAt?: Date | null
  berlanggananSampai?: Date | null
  trialEndsAt?: Date | null
}): TenantSubscriptionSnapshot {
  const startsAt = input.createdAt ?? new Date()
  const endsAt = input.berlanggananSampai ?? input.trialEndsAt ?? null
  const isTrialPlan = input.tenantStatus === 'TRIAL' || input.packageCode === 'FREE' || input.studentCapacity <= 0

  let status = 'ACTIVE'
  if (!input.isActive || input.tenantStatus === 'SUSPENDED' || input.tenantStatus === 'ARCHIVED') {
    status = 'SUSPENDED'
  } else if (endsAt && endsAt < new Date()) {
    status = 'EXPIRED'
  } else if (isTrialPlan) {
    status = 'TRIAL'
  }

  return {
    status,
    studentCapacity: input.studentCapacity,
    startsAt,
    endsAt,
    activatedAt: isTrialPlan ? null : (input.createdAt ?? new Date()),
    lastPaidAt: input.berlanggananSampai ? (input.updatedAt ?? new Date()) : null,
  }
}

export async function syncTenantSubscription(params: {
  db?: Pick<typeof prisma, 'tenantSubscription'>
  tenantId: string
  planId?: string | null
  tenantStatus?: string | null
  isActive: boolean
  packageCode: string
  studentCapacity: number
  createdAt?: Date | null
  updatedAt?: Date | null
  berlanggananSampai?: Date | null
  trialEndsAt?: Date | null
}) {
  const db = params.db ?? prisma
  const snapshot = buildTenantSubscriptionSnapshot({
    tenantStatus: params.tenantStatus,
    isActive: params.isActive,
    packageCode: params.packageCode,
    studentCapacity: params.studentCapacity,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    berlanggananSampai: params.berlanggananSampai,
    trialEndsAt: params.trialEndsAt,
  })

  return db.tenantSubscription.upsert({
    where: {
      tenantId: params.tenantId,
    },
    create: {
      tenantId: params.tenantId,
      planId: params.planId || null,
      status: snapshot.status,
      studentCapacity: snapshot.studentCapacity,
      startsAt: snapshot.startsAt,
      endsAt: snapshot.endsAt,
      activatedAt: snapshot.activatedAt,
      lastPaidAt: snapshot.lastPaidAt,
    },
    update: {
      planId: params.planId || null,
      status: snapshot.status,
      studentCapacity: snapshot.studentCapacity,
      startsAt: snapshot.startsAt,
      endsAt: snapshot.endsAt,
      activatedAt: snapshot.activatedAt,
      lastPaidAt: snapshot.lastPaidAt,
    },
  })
}

export function getFeatureLabel(featureKey: string) {
  return availableFeatures.find((feature) => feature.key === featureKey)?.label || featureKey
}

export async function logPlatformAudit(params: {
  actorUserId?: string | null
  actorName?: string | null
  actorRole?: string | null
  tenantId?: string | null
  action: string
  targetType: string
  targetId?: string | null
  summary: string
  metadata?: Record<string, unknown> | null
}) {
  await prisma.platformAuditLog.create({
    data: {
      actorUserId: params.actorUserId || null,
      actorName: params.actorName || null,
      actorRole: params.actorRole || null,
      tenantId: params.tenantId || null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || null,
      summary: params.summary,
      metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

export function buildTenantFeatureState(options: {
  planFeatures: string[]
  fullAccess?: boolean
  overrides: Array<{ featureKey: string; isEnabled: boolean }>
}) {
  const enabledByPlan = new Set(options.fullAccess ? availableFeatures.map((feature) => feature.key) : options.planFeatures)
  const overridesMap = new Map(options.overrides.map((item) => [item.featureKey, item.isEnabled]))

  return availableFeatures.map((feature) => {
    const override = overridesMap.get(feature.key)
    const effective = typeof override === 'boolean' ? override : enabledByPlan.has(feature.key)

    return {
      key: feature.key,
      label: feature.label,
      description: feature.description,
      source: typeof override === 'boolean' ? 'OVERRIDE' : 'PLAN',
      overrideState:
        typeof override === 'boolean'
          ? (override ? 'ENABLED' : 'DISABLED')
          : ('DEFAULT' as FeatureOverrideState),
      enabled: effective,
    }
  })
}
