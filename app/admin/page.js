import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminEventRow from './AdminEventRow'
import styles from './admin.module.css'

export const revalidate = 0

export default async function AdminDashboard() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  const totalSold = events?.reduce((s, e) => s + (e.sold || 0), 0) ?? 0
  const totalReserved = events?.reduce((s, e) => s + (e.reserved || 0), 0) ?? 0
  const totalConfirmed = events?.reduce((s, e) => s + (e.confirmed || 0), 0) ?? 0
  const totalWaitlist = events?.reduce((s, e) => s + (e.waitlist || 0), 0) ?? 0
  const activeCount = events?.filter(e => e.status === 'active').length ?? 0

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Upravljanje događajima</h1>
          <p className={styles.pageSubtitle}>{events?.length ?? 0} ukupno događaja</p>
        </div>
        <Link href="/admin/events/new" className={styles.btnPrimary}>
          ➕ Novi događaj
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Aktivni eventi</div>
          <div className={`${styles.statValue} ${styles.green}`}>{activeCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Prodato karte</div>
          <div className={`${styles.statValue} ${styles.pink}`}>{totalSold}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rezervisano</div>
          <div className={`${styles.statValue} ${styles.blue}`}>{totalReserved}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Potvrđeno</div>
          <div className={`${styles.statValue} ${styles.yellow}`}>{totalConfirmed}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Lista čekanja</div>
          <div className={`${styles.statValue} ${styles.purple}`}>{totalWaitlist}</div>
        </div>
      </div>

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
            {!events || events.length === 0 ? (
              <tr>
                <td colSpan={12} className={styles.emptyState}>
                  Nema događaja. <Link href="/admin/events/new">Dodaj prvi.</Link>
                </td>
              </tr>
            ) : (
              events.map(event => (
                <AdminEventRow key={event.id} event={event} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
