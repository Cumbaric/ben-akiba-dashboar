import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sortForMonth, isPastEvent } from '@/lib/sortEvents'
import { monthLabel, monthRange, parseMonthKey } from '@/lib/months'
import AdminTabs from '../../AdminTabs'
import ZurkeEventTable from '../../ZurkeEventTable'
import styles from '../../admin.module.css'

export const revalidate = 0

export default async function ZurkeMonth({ params }) {
  const { ym } = await params
  const parsed = parseMonthKey(ym)
  if (!parsed) notFound()
  const range = monthRange(ym)

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'zurka')
    .gte('date', range.start)
    .lt('date', range.end)
    .order('date', { ascending: true })

  const rows = sortForMonth(data, ym)
  const activeCount = rows.filter(e => e.status === 'active' && !isPastEvent(e)).length

  return (
    <div>
      <Link href="/admin/zurke" style={{ display: 'inline-block', marginBottom: 14, fontSize: 13, color: '#8888aa', textDecoration: 'none' }}>
        ← Svi meseci
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎉 Žurke · {monthLabel(ym)} {parsed.year}</h1>
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
