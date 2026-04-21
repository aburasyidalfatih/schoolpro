type TenantPengaturanRecord = Record<string, unknown>

export type EmailGatewaySettings = {
  provider: 'smtp_marketing'
  isActive: boolean
  host: string
  port: number
  username: string
  password: string
  fromName: string
  fromEmail: string
  secure: boolean
}

export type WhatsappGatewaySettings = {
  provider: 'starsender'
  isActive: boolean
  baseUrl: string
  apiKey: string
  deviceId: string
  senderName: string
}

export type TenantNotificationGatewaySettings = {
  emailGateway: EmailGatewaySettings
  whatsappGateway: WhatsappGatewaySettings
}

export const defaultTenantNotificationGatewaySettings: TenantNotificationGatewaySettings = {
  emailGateway: {
    provider: 'smtp_marketing',
    isActive: false,
    host: '',
    port: 587,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
    secure: false,
  },
  whatsappGateway: {
    provider: 'starsender',
    isActive: false,
    baseUrl: 'https://api.starsender.online',
    apiKey: '',
    deviceId: '',
    senderName: '',
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

function maskSecret(value: string) {
  if (!value) return ''
  if (value.length <= 6) return `${value.slice(0, 2)}...`
  return `${value.slice(0, 6)}...`
}

export function normalizeTenantNotificationGatewaySettings(pengaturan: unknown): TenantNotificationGatewaySettings {
  const rawPengaturan = isRecord(pengaturan) ? pengaturan : {}
  const rawEmail = isRecord(rawPengaturan.emailGateway) ? rawPengaturan.emailGateway : {}
  const rawWhatsapp = isRecord(rawPengaturan.whatsappGateway) ? rawPengaturan.whatsappGateway : {}

  return {
    emailGateway: {
      provider: 'smtp_marketing',
      isActive: getBoolean(rawEmail.isActive, defaultTenantNotificationGatewaySettings.emailGateway.isActive),
      host: getString(rawEmail.host, defaultTenantNotificationGatewaySettings.emailGateway.host),
      port: Math.max(1, getNumber(rawEmail.port, defaultTenantNotificationGatewaySettings.emailGateway.port)),
      username: getString(rawEmail.username, defaultTenantNotificationGatewaySettings.emailGateway.username),
      password: getString(rawEmail.password, defaultTenantNotificationGatewaySettings.emailGateway.password),
      fromName: getString(rawEmail.fromName, defaultTenantNotificationGatewaySettings.emailGateway.fromName),
      fromEmail: getString(rawEmail.fromEmail, defaultTenantNotificationGatewaySettings.emailGateway.fromEmail),
      secure: getBoolean(rawEmail.secure, defaultTenantNotificationGatewaySettings.emailGateway.secure),
    },
    whatsappGateway: {
      provider: 'starsender',
      isActive: getBoolean(rawWhatsapp.isActive, defaultTenantNotificationGatewaySettings.whatsappGateway.isActive),
      baseUrl: getString(rawWhatsapp.baseUrl, defaultTenantNotificationGatewaySettings.whatsappGateway.baseUrl),
      apiKey: getString(rawWhatsapp.apiKey, defaultTenantNotificationGatewaySettings.whatsappGateway.apiKey),
      deviceId: getString(rawWhatsapp.deviceId, defaultTenantNotificationGatewaySettings.whatsappGateway.deviceId),
      senderName: getString(rawWhatsapp.senderName, defaultTenantNotificationGatewaySettings.whatsappGateway.senderName),
    },
  }
}

export function maskTenantNotificationGatewaySettings(settings: TenantNotificationGatewaySettings): TenantNotificationGatewaySettings {
  return {
    emailGateway: {
      ...settings.emailGateway,
      password: maskSecret(settings.emailGateway.password),
    },
    whatsappGateway: {
      ...settings.whatsappGateway,
      apiKey: maskSecret(settings.whatsappGateway.apiKey),
    },
  }
}

function resolveSecret(currentValue: string, nextValue: string) {
  if (!nextValue) return ''
  if (nextValue.includes('...')) return currentValue
  return nextValue
}

export function mergeTenantNotificationGatewaySettings(options: {
  currentPengaturan: TenantPengaturanRecord
  incoming: TenantNotificationGatewaySettings
}): TenantPengaturanRecord {
  const current = normalizeTenantNotificationGatewaySettings(options.currentPengaturan)
  const incoming = options.incoming

  return {
    ...options.currentPengaturan,
    emailGateway: {
      provider: 'smtp_marketing',
      isActive: incoming.emailGateway.isActive,
      host: incoming.emailGateway.host.trim(),
      port: incoming.emailGateway.port,
      username: incoming.emailGateway.username.trim(),
      password: resolveSecret(current.emailGateway.password, incoming.emailGateway.password.trim()),
      fromName: incoming.emailGateway.fromName.trim(),
      fromEmail: incoming.emailGateway.fromEmail.trim(),
      secure: incoming.emailGateway.secure,
    },
    whatsappGateway: {
      provider: 'starsender',
      isActive: incoming.whatsappGateway.isActive,
      baseUrl: incoming.whatsappGateway.baseUrl.trim(),
      apiKey: resolveSecret(current.whatsappGateway.apiKey, incoming.whatsappGateway.apiKey.trim()),
      deviceId: incoming.whatsappGateway.deviceId.trim(),
      senderName: incoming.whatsappGateway.senderName.trim(),
    },
  }
}
