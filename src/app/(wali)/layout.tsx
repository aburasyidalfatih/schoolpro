import WaliSidebar from '@/components/layout/WaliSidebar'
import AdminHeader from '@/components/layout/AdminHeader' // We can reuse the header
import styles from '../(admin)/layout.module.css'

export default function WaliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.wrapper}>
      <WaliSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
