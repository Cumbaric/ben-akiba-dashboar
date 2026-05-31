import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminEventRow from './AdminEventRow'
import styles from './admin.module.css'

export const revalidate = 0

function EventTable({ rows }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Vreme</th>
            <th>Predstava</th>
            <th>Izvođač</th>
            <th>Cena</th>
            <th>Prodato</th>
            <th>Rezerv.</th>
            <th>Potvrđ.</th>
            <th>Čekanj.</th>
            <th>Slobod.</th>
            <th>Status</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={12} className={styles.emptyState}>
                Nema događaja. <Link href="/admin/events/new">Dodaj prvi.</Link>
              </td>
            </tr>
          ) : (
            rows.map(event => <AdminEventRow key={event.id} event={event} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function GroupSection({ title, accent, rows }) {
  const activeCount = rows.filter(e => e.status === 'active').length
  return (
    <section className={styles.groupSection}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>{title}</h2>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Aktivni eventi</div>
          <div className={`${styles.statValue} ${styles[accent]}`}>{activeCount}</div>
        </div>
      </div>
      <EventTable rows={rows} />
    </section>
  )
}

export default async function AdminDashboard() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  const all = events ?? []
  const standupEvents = all.filter(e => e.event_type === 'standup')
  const zurkaEvents = all.filter(e => e.event_type === 'zurka')

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Upravljanje događajima</h1>
          <p className={styles.pageSubtitle}>{all.length} ukupno događaja</p>
        </div>
        <Link href="/admin/events/new" className={styles.btnPrimary}>
          ➕ Novi događaj
        </Link>
      </div>

      <GroupSection title="🎤 Stand Up" accent="pink" rows={standupEvents} />
      <GroupSection title="🎉 Žurke" accent="purple" rows={zurkaEvents} />
    </div>
  )
}
