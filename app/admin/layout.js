import styles from './admin.module.css'
import AdminNav from './AdminNav'

export const metadata = {
  title: 'Admin | Ben Akiba',
}

export default function AdminLayout({ children }) {
  return (
    <div className={styles.layout}>
      <AdminNav />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
