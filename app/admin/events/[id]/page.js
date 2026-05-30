import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import StandupTables from './StandupTables'
import ZurkaTables from './ZurkaTables'
import styles from '../../admin.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }) {
  const { id } = await params

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  const { data: reservations } = await supabase
    .from('reservations').select('*').eq('event_id', id).order('sort_order').order('created_at')

  if (!event) {
    return <div style={{ padding: 40, color: 'var(--red)' }}>Događaj nije pronađen.</div>
  }

  const d = new Date(event.date)
  const day = DAY_NAMES[d.getDay()]
  const date = String(d.getDate()).padStart(2, '0')
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear()

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{event.title}</h1>
          <p className={styles.pageSubtitle}>
            {day} {date}.{month}.{year} &nbsp;·&nbsp; {event.time} &nbsp;·&nbsp; {event.performer}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href={`/admin/events/edit?id=${event.id}`} className={styles.editBtn} style={{ padding: '10px 18px' }}>
            ✏️ Uredi događaj
          </Link>
          <Link href="/admin" className={styles.btnSecondary} style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center' }}>
            ← Nazad
          </Link>
        </div>
      </div>

      {event.event_type === 'standup' ? (
        <StandupTables event={event} reservations={reservations || []} />
      ) : (
        <ZurkaTables event={event} reservations={reservations || []} />
      )}
    </div>
  )
}
