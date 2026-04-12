import '@/app/admin.css'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar'
import SuperAdminHeader from '@/components/layout/SuperAdminHeader'
import styles from '@/app/app/(portal)/(admin)/layout.module.css'

type LayoutUser = {
  name?: string | null
  role?: string | null
  email?: string | null
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user as LayoutUser | undefined

  if (!user) {
    redirect('/app/login')
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/app/dashboard')
  }

  return (
    <div className={styles.wrapper}>
      <SuperAdminSidebar />
      <div className={styles.main}>
        <SuperAdminHeader initialUser={user} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
