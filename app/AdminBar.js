import Link from 'next/link'
import { getSession } from '@/lib/auth'
import styles from './AdminBar.module.css'

// Prikazuje se na javnim stranama SAMO ako je korisnik prijavljen kao admin
export default async function AdminBar() {
  const isAdmin = await getSession()
  if (!isAdmin) return null

  return (
    <div className={styles.bar}>
      <span className={styles.badge}>👤 Prijavljeni kao admin</span>
      <div className={styles.links}>
        <Link href="/admin/standup" className={styles.link}>🎤 Stand Up</Link>
        <Link href="/admin/zurke" className={styles.link}>🎉 Žurke</Link>
        <Link href="/admin/standup" className={styles.linkPrimary}>← Admin panel</Link>
      </div>
    </div>
  )
}
