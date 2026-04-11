import '@/app/admin.css'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import styles from './layout.module.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const initialUser = session?.user

  return (
    <div className={styles.wrapper}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader initialUser={initialUser as any} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
