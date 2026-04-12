import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      role?: string
      tenantId?: string
      tenantSlug?: string
      tenantNama?: string
      nama?: string
      name?: string | null
      email?: string | null
    }
  }

  interface User {
    id?: string
    role?: string
    tenantId?: string
    tenantSlug?: string
    tenantNama?: string
    nama?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    tenantId?: string
    tenantSlug?: string
    tenantNama?: string
  }
}
