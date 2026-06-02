import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import StandupTables from './StandupTables'
import NightTables from './NightTables'
import DownloadPDF from './DownloadPDF'
import NightDownloadPDF from './NightDownloadPDF'
import styles from '../../admin.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }) {
  const { id } = await params

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()

  if (!event) {
    return <div style={{ padding: 40, color: 'var(--red)' }}>Događaj nije pronađen.</div>
  }

  const d = new Date(event.date)
  const day = DAY_NAMES[d.getDay()]
  const date = String(d.getDate()).padStart(2, '0')
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear()

  // ── ŽURKA: učitaj sve spratove te večeri (isti datum) ──
  if (event.event_type === 'zurka') {
    const { data: nightEvents } = await supabase
      .from('events')
      .select('*')
      .eq('event_type', 'zurka')
      .eq('date', event.date)
    const ids = (nightEvents || []).map(e => e.id)
    const { data: nightRes } = await supabase
      .from('reservations')
      .select('*')
      .in('event_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
      .order('sort_order')
      .order('created_at')

    return (
      <div>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>🎉 Žurka</h1>
            <p className={styles.pageSubtitle}>
              {day} {date}.{month}.{year} &nbsp;·&nbsp; {(nightEvents || []).length} {(nightEvents || []).length === 1 ? 'sprat' : 'sprata/spratova'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <NightDownloadPDF events={nightEvents || []} reservations={nightRes || []} />
            <Link href="/admin/zurke" className={styles.btnSecondary} style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center' }}>
              ← Nazad
            </Link>
          </div>
        </div>

        <NightTables events={nightEvents || []} reservations={nightRes || []} />
      </div>
    )
  }

  // ── STAND UP: jedan događaj ──
  const { data: reservations } = await supabase
    .from('reservations').select('*').eq('event_id', id).order('sort_order').order('created_at')

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{event.title}</h1>
          <p className={styles.pageSubtitle}>
            {day} {date}.{month}.{year} &nbsp;·&nbsp; {event.time} &nbsp;·&nbsp; {event.performer}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <DownloadPDF event={event} reservations={reservations || []} />
          <Link href={`/admin/events/edit?id=${event.id}`} className={styles.editBtn} style={{ padding: '10px 18px' }}>
            ✏️ Uredi događaj
          </Link>
          <Link href="/admin/standup" className={styles.btnSecondary} style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center' }}>
            ← Nazad
          </Link>
        </div>
      </div>

      <StandupTables event={event} reservations={reservations || []} />
    </div>
  )
}
