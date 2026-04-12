import type { Session } from 'next-auth'

export type AppSessionUser = NonNullable<Session['user']> & {
  id?: string
  role?: string
  tenantId?: string
  tenantSlug?: string
  tenantNama?: string
  nama?: string
}

export function getSessionUser(session: Session | null | undefined): AppSessionUser | null {
  if (!session?.user) {
    return null
  }

  return session.user as AppSessionUser
}

export function hasAnyRole(user: Pick<AppSessionUser, 'role'> | null | undefined, roles: string[]) {
  return typeof user?.role === 'string' && roles.includes(user.role)
}
