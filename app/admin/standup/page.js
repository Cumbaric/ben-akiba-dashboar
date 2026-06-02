import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminTabs from '../AdminTabs'
import EventTable from '../EventTable'
import styles from '../admin.module.css'

export const revalidate = 0

export default async function StandupAdmin() {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'standup')
    .order('date', { ascending: true })

  const baseRows = data ?? []

  // Računaj rezervacije iz reservations tabele (ne iz starih ručnih polja)
  const ids = baseRows.map(e => e.id)
  const { data: reservations } = await supabase
    .from('reservations')
    .select('event_id, section, num_people, confirmed')
    .in('event_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

  const stats = {}
  ;(reservations || []).forEach(r => {
    if (!stats[r.event_id]) stats[r.event_id] = { tickets: 0, phone: 0, free: 0, waitlist: 0, confirmed: 0 }
    const n = r.num_people || 0
    if (r.section === 'tickets') stats[r.event_id].tickets += n
    else if (r.section === 'phone') stats[r.event_id].phone += n
    else if (r.section === 'free') stats[r.event_id].free += n
    else if (r.section === 'waitlist') stats[r.event_id].waitlist += n
    if (r.confirmed && r.section !== 'waitlist') stats[r.event_id].confirmed += n
  })

  // Mapiraj izračunate vrednosti u kolone (Prodato=tickets, Rezerv.=telefon+free)
  const rows = baseRows.map(e => {
    const s = stats[e.id] || { tickets: 0, phone: 0, free: 0, waitlist: 0, confirmed: 0 }
    return {
      ...e,
      sold: s.tickets,
      reserved: s.phone + s.free,
      confirmed: s.confirmed,
      waitlist: s.waitlist,
    }
  })

  const activeCount = rows.filter(e => e.status === 'active').length

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎤 Stand Up</h1>
          <p className={styles.pageSubtitle}>{rows.length} događaja</p>
        </div>
        <Link href="/admin/events/new" className={styles.btnPrimary}>
          ➕ Novi događaj
        </Link>
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
