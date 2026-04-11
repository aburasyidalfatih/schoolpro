import '@/app/admin.css'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import WaliSidebar from '@/components/layout/WaliSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import styles from '../(admin)/layout.module.css'

export default async function WaliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/app/login')
  }

  const role = (session.user as any).role
  if (role !== 'WALI' && role !== 'SISWA' && role !== 'USER') {
    redirect('/app/dashboard')
  }

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
