import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sortForMonth, isPastEvent } from '@/lib/sortEvents'
import { withStandupStats } from '@/lib/standupStats'
import { monthLabel, monthRange, parseMonthKey } from '@/lib/months'
import AdminTabs from '../../AdminTabs'
import EventTable from '../../EventTable'
import ExportRepertoarImage from '../../ExportRepertoarImage'
import styles from '../../admin.module.css'

export const revalidate = 0

export default async function StandupMonth({ params }) {
  const { ym } = await params
  const parsed = parseMonthKey(ym)
  if (!parsed) notFound()
  const range = monthRange(ym)

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'standup')
    .gte('date', range.start)
    .lt('date', range.end)
    .order('date', { ascending: true })

  const { rows, exportRows } = await withStandupStats(sortForMonth(data, ym))
  const activeCount = rows.filter(e => e.status === 'active' && !isPastEvent(e)).length

  return (
    <div>
      <Link href="/admin/standup" style={{ display: 'inline-block', marginBottom: 14, fontSize: 13, color: '#8888aa', textDecoration: 'none' }}>
        ← Svi meseci
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎤 Stand Up · {monthLabel(ym)} {parsed.year}</h1>
          <p className={styles.pageSubtitle}>{rows.length} događaja</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ExportRepertoarImage rows={exportRows} />
          <Link href="/admin/events/new" className={styles.btnPrimary}>
            ➕ Novi događaj
          </Link>
        </div>
      </div>

      <AdminTabs active="standup" />

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Aktivni eventi</div>
          <div className={`${styles.statValue} ${styles.pink}`}>{activeCount}</div>
        </div>
      </div>

      <EventTable rows={rows} />
    </div>
  )
}
