import styles from './admin.module.css'
import AdminNav from './AdminNav'
import { getSession } from '@/lib/auth'

export const metadata = {
  title: 'Admin | Ben Akiba',
}

export default async function AdminLayout({ children }) {
  // Header (navigacija) samo za prijavljenog admina; login stranica ga nema
  const isAdmin = await getSession()

  return (
    <div className={styles.layout}>
      {isAdmin && <AdminNav />}
      <main className={styles.main}>{children}</main>
    </div>
  )
}
