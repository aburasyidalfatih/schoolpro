/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        tenantSlug: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const tenantSlug = (credentials.tenantSlug as string) || 'demo'

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug, isActive: true },
        })
        if (!tenant) return null

        const user = await prisma.user.findFirst({
          where: {
            tenantId: tenant.id,
            username: credentials.username as string,
            isActive: true,
          },
        })
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!isValid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: tenant.slug,
          tenantNama: tenant.nama,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
        token.tenantNama = user.tenantNama
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.tenantId = token.tenantId
        session.user.tenantSlug = token.tenantSlug
        session.user.tenantNama = token.tenantNama
      }
      return session
    },
  },
  pages: {
    signIn: '/app/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
})
