import Link from 'next/link'
import styles from './admin.module.css'

export default function AdminTabs({ active }) {
  return (
    <div className={styles.tabs}>
      <Link
        href="/admin/standup"
        className={`${styles.tab} ${active === 'standup' ? styles.tabActive : ''}`}
      >
        🎤 Stand Up
      </Link>
      <Link
        href="/admin/zurke"
        className={`${styles.tab} ${active === 'zurke' ? styles.tabActive : ''}`}
      >
        🎉 Žurke
      </Link>
    </div>
  )
}
