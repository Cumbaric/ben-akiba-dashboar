import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminTabs from '../AdminTabs'
import ZurkeEventTable from '../ZurkeEventTable'
import styles from '../admin.module.css'

export const revalidate = 0

export default async function ZurkeAdmin() {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'zurka')
    .order('date', { ascending: true })

  const rows = data ?? []
  const activeCount = rows.filter(e => e.status === 'active').length

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎉 Žurke</h1>
          <p className={styles.pageSubtitle}>{rows.length} događaja</p>
        </div>
        <Link href="/admin/zurke/new" className={styles.btnPrimary}>
          ➕ Nova žurka
        </Link>
      </div>

      <AdminTabs active="zurke" />

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Aktivni eventi</div>
          <div className={`${styles.statValue} ${styles.purple}`}>{activeCount}</div>
        </div>
      </div>

      <ZurkeEventTable rows={rows} />
    </div>
  )
}
