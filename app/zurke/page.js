import { Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminBar from '../AdminBar'
import styles from './zurke.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['01','02','03','04','05','06','07','08','09','10','11','12']

const FLOOR_LABELS = {
  ground_floor: 'Ground Floor',
  white_lounge: 'White Lounge',
  after: 'After',
  all: null,
}

export const dynamic = 'force-dynamic'

export default async function ZurkePage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'zurka')
    .order('date', { ascending: true })

  // Dohvati broj rezervacija po eventu
  const { data: reservations } = await supabase
    .from('reservations')
    .select('event_id, num_people')

  // Zbir rezervacija po event_id
  const reservationCounts = {}
  if (reservations) {
    reservations.forEach(r => {
      reservationCounts[r.event_id] = (reservationCounts[r.event_id] || 0) + (r.num_people || 0)
    })
  }

  // Grupisanje događaja po datumu (žurke istog dana = jedna celina)
  const groups = []
  const map = new Map()
  for (const ev of (events || [])) {
    if (!map.has(ev.date)) {
      const g = { date: ev.date, events: [] }
      map.set(ev.date, g)
      groups.push(g)
    }
    map.get(ev.date).events.push(ev)
  }

  const fmtDate = (dateStr) => {
    const d = new Date(dateStr)
    return { day: DAY_NAMES[d.getDay()], date: `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.` }
  }

  const isEmpty = !events || events.length === 0

  return (
    <div className={styles.page}>
      <AdminBar />
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>← Nazad</Link>
        <div className={styles.logoWrap}>
          <img src="/logo-transparent.png" alt="Ben Akiba" className={styles.logoImg} />
          <div className={styles.logoSub}>Comedy Club &amp; Bar · White Lounge &amp; Art Gallery</div>
        </div>
        <div className={styles.zurkaBadge}>
          <div className={styles.zurkaRow}>
            <div className={styles.zurkaIcon}>🪩</div>
            <div className={styles.zurkaTitle}>Žurka</div>
          </div>
          <div className={styles.zurkaSub}>Repertoar</div>
        </div>
      </header>

      <main className={styles.container}>

        {/* ── DESKTOP TABLE ── */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>📅 Datum</th>
                <th>🕐 Vreme</th>
                <th>🏢 Sprat</th>
                <th>👤 Izvođač</th>
                <th>👥 Rezervacije</th>
                <th>🎟 Cena</th>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>Nema zakazanih žurki.</td>
                </tr>
              ) : (
                groups.map((g) => {
                  const { day, date } = fmtDate(g.date)
                  const multi = g.events.length > 1
                  return (
                    <Fragment key={g.date}>
                      <tr className={styles.dateGroupRow}>
                        <td colSpan={6}>
                          <span className={styles.dateGroupLabel}>📅 {day} {date}</span>
                          {multi && <span className={styles.dateGroupCount}>{g.events.length} događaja te večeri</span>}
                        </td>
                      </tr>
                      {g.events.map((event) => {
                        const floorLabel = FLOOR_LABELS[event.floor]
                        const resCount = reservationCounts[event.id] || 0
                        return (
                          <tr key={event.id} className={event.status === 'cancelled' ? styles.cancelled : ''}>
                            <td className={styles.subDateCell}>{multi ? '↳' : ''}</td>
                            <td className={styles.timeCell}>{event.time}</td>
                            <td>
                              {floorLabel && <span className={styles.floorBadge}>{floorLabel}</span>}
                              {event.status === 'cancelled' && (
                                <span className={styles.cancelBadge}>Otkazano</span>
                              )}
                            </td>
                            <td className={styles.performerCell}>{event.performer}</td>
                            <td className={styles.resCell}>
                              <span className={styles.resBadge}>{resCount}</span>
                            </td>
                            <td className={styles.priceCell}>
                              <span className={styles.priceBadge}>
                                {Number(event.price).toLocaleString('sr-RS')} RSD
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS (jedna kartica po danu) ── */}
        <div className={styles.mobileCards}>
          {isEmpty ? (
            <div className={styles.emptyState}>Nema zakazanih žurki.</div>
          ) : (
            groups.map((g) => {
              const { day, date } = fmtDate(g.date)
              const multi = g.events.length > 1
              return (
                <div key={g.date} className={styles.mobileCard}>
                  {/* Datum (zaglavlje kartice) */}
                  <div className={styles.mobileRow1}>
                    <span className={styles.mobileDayName}>{day}</span>
                    <span className={styles.mobileDateNum}>{date}</span>
                    {multi && <span className={styles.mobileCount}>{g.events.length} događaja</span>}
                  </div>

                  {/* Događaji tog dana */}
                  {g.events.map((event) => {
                    const floorLabel = FLOOR_LABELS[event.floor]
                    const resCount = reservationCounts[event.id] || 0
                    return (
                      <div key={event.id} className={`${styles.mobileEventBlock} ${event.status === 'cancelled' ? styles.cancelled : ''}`}>
                        <div className={styles.mobileEventTop}>
                          {floorLabel && <span className={styles.floorBadge}>{floorLabel}</span>}
                          <span className={styles.mobileTime}>🕐 {event.time}</span>
                          {event.status === 'cancelled' && (
                            <span className={styles.cancelBadge}>Otkazano</span>
                          )}
                        </div>

                        {event.title && <div className={styles.mobileTitle}>{event.title}</div>}

                        <div className={styles.mobilePerformer}>👤 {event.performer}</div>

                        <div className={styles.mobileCardBottom}>
                          <span className={styles.mobileResWrap}>
                            👥 Rezervacije: <span className={styles.resBadge}>{resCount}</span>
                          </span>
                          <span className={styles.priceBadge}>{Number(event.price).toLocaleString('sr-RS')} RSD</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className={styles.footerNote}>
          Ben Akiba &nbsp;·&nbsp; Belgrade &nbsp;·&nbsp; Good Vibes Only
        </div>
      </main>
    </div>
  )
}
