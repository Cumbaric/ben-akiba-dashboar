'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './admin.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

const FLOOR_LABELS = {
  ground_floor: 'Ground Floor',
  white_lounge: 'White Lounge',
  after: 'After',
  all: 'Sve sale',
}

const FLOOR_CLASS = {
  ground_floor: 'floorGround',
  white_lounge: 'floorWhite',
  after: 'floorAfter',
  all: 'floorAll',
}

export default function AdminEventRow({ event, hideDate = false, showFloor = false, noDateCol = false, hideReservations = false }) {
  const router = useRouter()
  const d = new Date(event.date)
  const dateStr = `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${MONTH_NAMES[d.getMonth()]}`
  const freeSeats = (event.capacity || 0) - (event.sold || 0) - (event.reserved || 0)

  async function handleDelete() {
    if (!confirm(`Obrisati "${event.title}"?`)) return
    await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <tr>
      {!noDateCol && (
        <td style={{ whiteSpace: 'nowrap', color: hideDate ? 'var(--text-muted)' : undefined, paddingLeft: hideDate ? 28 : undefined }}>
          {hideDate ? '↳' : dateStr}
        </td>
      )}
      <td>{event.time}</td>
      <td style={{ fontWeight: 600 }}>
        {showFloor
          ? (FLOOR_LABELS[event.floor]
              ? <span className={`${styles.floorTag} ${styles[FLOOR_CLASS[event.floor]] || ''}`}>{FLOOR_LABELS[event.floor]}</span>
              : <span style={{ color: 'var(--text-muted)' }}>—</span>)
          : event.title}
      </td>
      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{event.performer}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{Number(event.price).toLocaleString('sr-RS')} RSD</td>
      <td><span className={`${styles.statNum} ${styles.pink}`}>{event.sold ?? 0}</span></td>
      <td><span className={`${styles.statNum} ${styles.blue}`}>{event.reserved ?? 0}</span></td>
      <td><span className={`${styles.statNum} ${styles.yellow}`}>{event.confirmed ?? 0}</span></td>
      <td><span className={`${styles.statNum} ${styles.purple}`}>{event.waitlist ?? 0}</span></td>
      <td><span className={`${styles.statNum} ${styles.green}`}>{freeSeats}</span></td>
      <td>
        <span className={`${styles.statusBadge} ${event.status === 'active' ? styles.active : styles.cancelled}`}>
          <span className={styles.dot} />
          {event.status === 'active' ? 'Aktivno' : 'Otkazano'}
        </span>
      </td>
      <td>
        <div className={styles.actions}>
          {!hideReservations && (
            <Link href={`/admin/events/${event.id}`} className={styles.editBtn} style={{ background: 'rgba(233,30,140,0.08)', borderColor: 'var(--pink)', color: 'var(--pink)' }}>
              📋 Rezervacije
            </Link>
          )}
          <Link href={`/admin/events/edit?id=${event.id}`} className={styles.editBtn}>
            ✏️ Uredi
          </Link>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑
          </button>
        </div>
      </td>
    </tr>
  )
}
