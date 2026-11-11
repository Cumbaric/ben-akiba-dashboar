import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sortUpcomingFirst, isPastEvent } from '@/lib/sortEvents'
import { withStandupStats } from '@/lib/standupStats'
import { monthLabel, parseMonthKey } from '@/lib/months'
import EventTable from '../../EventTable'
import ZurkeEventTable from '../../ZurkeEventTable'
import ExportRepertoarImage from '../../ExportRepertoarImage'
import adminStyles from '../../admin.module.css'
import styles from '../../months.module.css'

export const revalidate = 0

const pad = n => String(n).padStart(2, '0')

export default async function MonthPage({ params }) {
  const { ym } = await params
  const parsed = parseMonthKey(ym)
  if (!parsed) notFound()

  const { year, month } = parsed
  const start = `${year}-${pad(month)}-01`
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  const end = `${next.y}-${pad(next.m)}-01`
  const prevKey = month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`
  const nextKey = `${next.y}-${pad(next.m)}`

  const { data } = await supabase
    .from('events')
    .select('*')
    .gte('date', start)
    .lt('date', end)
    .order('date', { ascending: true })

  const all = data ?? []
  // U mesečnom pregledu (i arhivi) ide hronološki: prvi dan meseca pa nadalje
  const byDate = (a, b) =>
    String(a.date).localeCompare(String(b.date)) || String(a.time || '').localeCompare(String(b.time || ''))
  const standupEvents = all.filter(e => e.event_type === 'standup').sort(byDate)
  const zurkaEvents = all.filter(e => e.event_type === 'zurka').sort(byDate)

  const { rows: standupRows, exportRows } = await withStandupStats(standupEvents)

  const title = `${monthLabel(ym)} ${year}`
  const activeStandup = standupRows.filter(e => e.status === 'active' && !isPastEvent(e)).length
  const activeZurke = zurkaEvents.filter(e => e.status === 'active' && !isPastEvent(e)).length

  return (
    <div>
      <Link href="/admin" className={styles.backLink}>← Svi meseci</Link>

      <div className={adminStyles.pageHeader}>
        <div>
          <h1 className={adminStyles.pageTitle}>📅 {title}</h1>
          <p className={adminStyles.pageSubtitle}>
            {all.length} događaja · aktivnih: {activeStandup + activeZurke}
          </p>
        </div>
        <div className={styles.monthNav}>
          <Link href={`/admin/mesec/${prevKey}`} className={adminStyles.editBtn}>← {monthLabel(prevKey)}</Link>
          <Link href={`/admin/mesec/${nextKey}`} className={adminStyles.editBtn}>{monthLabel(nextKey)} →</Link>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            🎤 Stand Up<span className={styles.sectionCount}>{standupRows.length} događaja</span>
          </h2>
          {standupRows.length > 0 && <ExportRepertoarImage rows={exportRows} />}
        </div>
        <EventTable rows={standupRows} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            🎉 Žurke<span className={styles.sectionCount}>{zurkaEvents.length} događaja</span>
          </h2>
        </div>
        <ZurkeEventTable rows={zurkaEvents} />
      </section>
    </div>
  )
}
