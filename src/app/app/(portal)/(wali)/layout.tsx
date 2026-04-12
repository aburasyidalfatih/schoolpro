import '@/app/admin.css'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import WaliSidebar from '@/components/layout/WaliSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import styles from '../(admin)/layout.module.css'

type LayoutUser = {
  name?: string | null
  role?: string | null
  email?: string | null
}

export default async function WaliLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/app/login')
  }

  const user = session.user as LayoutUser
  const role = user.role
  if (role !== 'WALI' && role !== 'SISWA' && role !== 'USER') {
    redirect('/app/dashboard')
  }

  return (
    <div className={styles.wrapper}>
      <WaliSidebar />
      <div className={styles.main}>
        <AdminHeader initialUser={user} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
