import { Fragment } from 'react'
import Link from 'next/link'
import AdminEventRow from './AdminEventRow'
import styles from './admin.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

export default function ZurkeEventTable({ rows }) {
  // Grupisanje događaja po datumu (žurke istog dana = jedna celina)
  const groups = []
  const map = new Map()
  for (const ev of rows) {
    if (!map.has(ev.date)) {
      const g = { date: ev.date, events: [] }
      map.set(ev.date, g)
      groups.push(g)
    }
    map.get(ev.date).events.push(ev)
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vreme</th>
            <th>Sprat</th>
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
              <td colSpan={11} className={styles.emptyState}>
                Nema događaja. <Link href="/admin/events/new">Dodaj prvi.</Link>
              </td>
            </tr>
          ) : (
            groups.map(g => {
              const d = new Date(g.date)
              const dateStr = `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${MONTH_NAMES[d.getMonth()]}`
              return (
                <Fragment key={g.date}>
                  <tr className={styles.dateGroupRow}>
                    <td colSpan={11}>
                      <div className={styles.dateGroupBar}>
                        <div>
                          <span className={styles.dateGroupLabel}>📅 {dateStr}</span>
                          {g.events.length > 1 && (
                            <span className={styles.dateGroupCount}>{g.events.length} događaja te večeri</span>
                          )}
                        </div>
                        <Link
                          href={`/admin/events/${g.events[0].id}`}
                          className={styles.editBtn}
                          style={{ background: 'rgba(233,30,140,0.08)', borderColor: 'var(--pink)', color: 'var(--pink)' }}
                        >
                          📋 Rezervacije (cela večer)
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {g.events.map(ev => (
                    <AdminEventRow key={ev.id} event={ev} showFloor noDateCol hideReservations />
                  ))}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
