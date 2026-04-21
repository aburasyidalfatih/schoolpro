import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { availableFeatures } from '@/lib/super-admin'

const PLATFORM_SETTING_KEY = 'super_admin_settings'

export type ProvisioningDefaults = {
  defaultPlanCode: string
  defaultTrialDays: number
  defaultTrialStudentCapacity: number
  defaultFeatureKeys: string[]
  requireManualTenantActivation: boolean
}

export type BillingDefaults = {
  paymentBankName: string
  paymentAccountName: string
  paymentAccountNumber: string
  paymentInstructions: string
  orderExpiryDays: number
  renewalReminderDays: number
}

export type PlatformNotificationSettings = {
  operationsEmail: string
  billingEmail: string
  supportWhatsapp: string
  notifyNewTenantApplication: boolean
  notifySubscriptionOrder: boolean
  notifyExpiringSubscription: boolean
}

export type PlatformSettings = {
  provisioning: ProvisioningDefaults
  billing: BillingDefaults
  notifications: PlatformNotificationSettings
}

export type ProvisionedTenantDefaults = {
  planCode: string
  trialDays: number
  studentCapacity: number
  featureKeys: string[]
  requiresManualActivation: boolean
}

export const defaultPlatformSettings: PlatformSettings = {
  provisioning: {
    defaultPlanCode: 'FREE',
    defaultTrialDays: 14,
    defaultTrialStudentCapacity: 0,
    defaultFeatureKeys: ['website', 'cms'],
    requireManualTenantActivation: true,
  },
  billing: {
    paymentBankName: 'Bank BCA',
    paymentAccountName: 'PT SchoolPro Indonesia',
    paymentAccountNumber: '1234567890',
    paymentInstructions: 'Transfer sesuai nominal order lalu upload bukti pembayaran agar bisa diverifikasi super admin.',
    orderExpiryDays: 3,
    renewalReminderDays: 14,
  },
  notifications: {
    operationsEmail: 'ops@schoolpro.id',
    billingEmail: 'billing@schoolpro.id',
    supportWhatsapp: '081234567890',
    notifyNewTenantApplication: true,
    notifySubscriptionOrder: true,
    notifyExpiringSubscription: true,
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function getBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function getNumber(value: unknown, fallback: number) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function getStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback
  return value.filter((item): item is string => typeof item === 'string')
}

export function normalizePlatformSettings(value: unknown): PlatformSettings {
  const raw = isRecord(value) ? value : {}
  const rawProvisioning = isRecord(raw.provisioning) ? raw.provisioning : {}
  const rawBilling = isRecord(raw.billing) ? raw.billing : {}
  const rawNotifications = isRecord(raw.notifications) ? raw.notifications : {}

  const allowedFeatureKeys = new Set<string>(availableFeatures.map((feature) => feature.key))
  const defaultFeatureKeys = getStringArray(
    rawProvisioning.defaultFeatureKeys,
    defaultPlatformSettings.provisioning.defaultFeatureKeys
  ).filter((key) => allowedFeatureKeys.has(key))

  return {
    provisioning: {
      defaultPlanCode: getString(rawProvisioning.defaultPlanCode, defaultPlatformSettings.provisioning.defaultPlanCode).toUpperCase(),
      defaultTrialDays: Math.max(0, getNumber(rawProvisioning.defaultTrialDays, defaultPlatformSettings.provisioning.defaultTrialDays)),
      defaultTrialStudentCapacity: Math.max(0, getNumber(rawProvisioning.defaultTrialStudentCapacity, defaultPlatformSettings.provisioning.defaultTrialStudentCapacity)),
      defaultFeatureKeys: defaultFeatureKeys.length > 0 ? defaultFeatureKeys : defaultPlatformSettings.provisioning.defaultFeatureKeys,
      requireManualTenantActivation: getBoolean(
        rawProvisioning.requireManualTenantActivation,
        defaultPlatformSettings.provisioning.requireManualTenantActivation
      ),
    },
    billing: {
      paymentBankName: getString(rawBilling.paymentBankName, defaultPlatformSettings.billing.paymentBankName),
      paymentAccountName: getString(rawBilling.paymentAccountName, defaultPlatformSettings.billing.paymentAccountName),
      paymentAccountNumber: getString(rawBilling.paymentAccountNumber, defaultPlatformSettings.billing.paymentAccountNumber),
      paymentInstructions: getString(rawBilling.paymentInstructions, defaultPlatformSettings.billing.paymentInstructions),
      orderExpiryDays: Math.max(1, getNumber(rawBilling.orderExpiryDays, defaultPlatformSettings.billing.orderExpiryDays)),
      renewalReminderDays: Math.max(1, getNumber(rawBilling.renewalReminderDays, defaultPlatformSettings.billing.renewalReminderDays)),
    },
    notifications: {
      operationsEmail: getString(rawNotifications.operationsEmail, defaultPlatformSettings.notifications.operationsEmail),
      billingEmail: getString(rawNotifications.billingEmail, defaultPlatformSettings.notifications.billingEmail),
      supportWhatsapp: getString(rawNotifications.supportWhatsapp, defaultPlatformSettings.notifications.supportWhatsapp),
      notifyNewTenantApplication: getBoolean(
        rawNotifications.notifyNewTenantApplication,
        defaultPlatformSettings.notifications.notifyNewTenantApplication
      ),
      notifySubscriptionOrder: getBoolean(
        rawNotifications.notifySubscriptionOrder,
        defaultPlatformSettings.notifications.notifySubscriptionOrder
      ),
      notifyExpiringSubscription: getBoolean(
        rawNotifications.notifyExpiringSubscription,
        defaultPlatformSettings.notifications.notifyExpiringSubscription
      ),
    },
  }
}

export async function getPlatformSettings() {
  const existing = await prisma.platformSetting.findUnique({
    where: { key: PLATFORM_SETTING_KEY },
  })

  if (!existing) {
    return defaultPlatformSettings
  }

  return normalizePlatformSettings(existing.value)
}

export async function savePlatformSettings(settings: PlatformSettings) {
  return prisma.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEY },
    create: {
      key: PLATFORM_SETTING_KEY,
      value: settings as Prisma.InputJsonValue,
    },
    update: {
      value: settings as Prisma.InputJsonValue,
    },
  })
}

export function buildOrderExpiryDate(orderExpiryDays: number, baseDate = new Date()) {
  return new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * orderExpiryDays)
}

export function buildProvisioningDefaultsSnapshot(settings: PlatformSettings): ProvisionedTenantDefaults {
  return {
    planCode: settings.provisioning.defaultPlanCode,
    trialDays: settings.provisioning.defaultTrialDays,
    studentCapacity: settings.provisioning.defaultTrialStudentCapacity,
    featureKeys: settings.provisioning.defaultFeatureKeys,
    requiresManualActivation: settings.provisioning.requireManualTenantActivation,
  }
}
