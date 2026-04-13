export type AppContext =
  | { appType: 'marketing'; env: 'local' | 'dev' | 'prod' }
  | { appType: 'platform'; env: 'dev' | 'prod' }
  | { appType: 'tenant'; env: 'dev' | 'prod'; tenantSlug: string; isDemo: boolean }

export const DEV_MARKETING_HOST = 'dev.schoolpro.id'
export const DEV_PLATFORM_HOST = 'ops-dev.schoolpro.id'
export const DEV_DEMO_HOST = 'demo-dev.schoolpro.id'
export const PROD_MARKETING_HOST = 'schoolpro.id'
export const PROD_WWW_MARKETING_HOST = 'www.schoolpro.id'
export const PROD_PLATFORM_HOST = 'ops.schoolpro.id'
export const PROD_DEMO_HOST = 'demo.schoolpro.id'

export function normalizeHostname(hostname: string) {
  return hostname.split(':')[0].trim().toLowerCase()
}

export function resolveAppContext(hostname: string): AppContext {
  const host = normalizeHostname(hostname)

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return { appType: 'marketing', env: 'local' }
  }

  if (host === DEV_MARKETING_HOST) {
    return { appType: 'marketing', env: 'dev' }
  }

  if (host === PROD_MARKETING_HOST || host === PROD_WWW_MARKETING_HOST) {
    return { appType: 'marketing', env: 'prod' }
  }

  if (host === DEV_PLATFORM_HOST) {
    return { appType: 'platform', env: 'dev' }
  }

  if (host === PROD_PLATFORM_HOST) {
    return { appType: 'platform', env: 'prod' }
  }

  if (host === DEV_DEMO_HOST) {
    return { appType: 'tenant', env: 'dev', tenantSlug: 'demo', isDemo: true }
  }

  if (host === PROD_DEMO_HOST) {
    return { appType: 'tenant', env: 'prod', tenantSlug: 'demo', isDemo: true }
  }

  if (host.endsWith('.schoolpro.id')) {
    const subdomain = host.replace(/\.schoolpro\.id$/, '')

    if (subdomain.endsWith('-dev')) {
      const tenantSlug = subdomain.slice(0, -4)
      if (tenantSlug) {
        return { appType: 'tenant', env: 'dev', tenantSlug, isDemo: tenantSlug === 'demo' }
      }
    }

    const tenantSlug = subdomain
    if (tenantSlug) {
      return { appType: 'tenant', env: 'prod', tenantSlug, isDemo: tenantSlug === 'demo' }
    }
  }

  return { appType: 'marketing', env: 'local' }
}

export function getPlatformHost(hostname: string) {
  const context = resolveAppContext(hostname)
  return context.env === 'prod' ? PROD_PLATFORM_HOST : DEV_PLATFORM_HOST
}

export function getDemoHost(hostname: string) {
  const context = resolveAppContext(hostname)
  return context.env === 'prod' ? PROD_DEMO_HOST : DEV_DEMO_HOST
}

export function getTenantHost(tenantSlug: string, hostname: string) {
  const context = resolveAppContext(hostname)
  if (context.env === 'prod') {
    return `${tenantSlug}.schoolpro.id`
  }
  return `${tenantSlug}-dev.schoolpro.id`
}

export function resolveTenantSlugForAuth(hostname: string) {
  const context = resolveAppContext(hostname)
  if (context.appType === 'tenant') {
    return context.tenantSlug
  }
  return ''
}
