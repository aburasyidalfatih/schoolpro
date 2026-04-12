import '@/app/admin.css'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import styles from './layout.module.css'

type LayoutUser = {
  name?: string | null
  role?: string | null
  email?: string | null
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const initialUser = session?.user as LayoutUser | undefined

  return (
    <div className={styles.wrapper}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader initialUser={initialUser} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
