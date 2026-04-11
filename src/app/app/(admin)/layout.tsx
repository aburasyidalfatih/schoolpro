import '@/app/admin.css'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import styles from './layout.module.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.wrapper}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
