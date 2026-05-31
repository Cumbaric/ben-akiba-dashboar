'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './admin.module.css'

export default function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.navLogo}>
        <Link href="/admin">
          <img src="/logo-transparent.png" alt="Ben Akiba" className={styles.navLogoImg} />
        </Link>
        <span className={styles.navBadge}>Admin</span>
      </div>
      <div className={styles.navLinks}>
        <Link href="/" className={styles.navLink} target="_blank">
          👁 Javni sajt
        </Link>
        <Link href="/admin/standup" className={styles.navLink}>
          🎤 Stand Up
        </Link>
        <Link href="/admin/zurke" className={styles.navLink}>
          🎉 Žurke
        </Link>
        <Link href="/admin/events/new" className={styles.navLink}>
          ➕ Novi događaj
        </Link>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Odjavi se
        </button>
      </div>
    </nav>
  )
}
