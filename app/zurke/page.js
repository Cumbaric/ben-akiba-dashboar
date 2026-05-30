import { supabase } from '@/lib/supabase'
import Link from 'next/link'
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

  return (
    <div className={styles.page}>
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
                <th>🎉 Događaj</th>
                <th>👤 Izvođač</th>
                <th>👥 Rezervacije</th>
                <th>🎟 Cena</th>
              </tr>
            </thead>
            <tbody>
              {!events || events.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>Nema zakazanih žurki.</td>
                </tr>
              ) : (
                events.map((event) => {
                  const d = new Date(event.date)
                  const day = DAY_NAMES[d.getDay()]
                  const date = `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.`
                  const floorLabel = FLOOR_LABELS[event.floor]
                  const resCount = reservationCounts[event.id] || 0
                  return (
                    <tr key={event.id} className={event.status === 'cancelled' ? styles.cancelled : ''}>
                      <td>
                        <div className={styles.dateCell}>
                          <span className={styles.dayName}>{day}</span>
                          <span className={styles.dateNum}>{date}</span>
                        </div>
                      </td>
                      <td className={styles.timeCell}>{event.time}</td>
                      <td>
                        {floorLabel && <span className={styles.floorBadge}>{floorLabel}</span>}
                      </td>
                      <td>
                        <div className={styles.showCell}>
                          <span className={styles.showName}>{event.title}</span>
                          {event.status === 'cancelled' && (
                            <span className={styles.cancelBadge}>Otkazano</span>
                          )}
                        </div>
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
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className={styles.mobileCards}>
          {!events || events.length === 0 ? (
            <div className={styles.emptyState}>Nema zakazanih žurki.</div>
          ) : (
            events.map((event) => {
              const d = new Date(event.date)
              const day = DAY_NAMES[d.getDay()]
              const date = `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.`
              const floorLabel = FLOOR_LABELS[event.floor]
              const resCount = reservationCounts[event.id] || 0
              return (
                <div key={event.id} className={`${styles.mobileCard} ${event.status === 'cancelled' ? styles.cancelled : ''}`}>

                  {/* Datum + vreme */}
                  <div className={styles.mobileRow1}>
                    <span className={styles.mobileDayName}>{day}</span>
                    <span className={styles.mobileDateNum}>{date}</span>
                    <span className={styles.mobileSep}>·</span>
                    <span className={styles.mobileTime}>🕐 {event.time}</span>
                  </div>

                  {/* Naziv */}
                  <div className={styles.mobileTitle}>
                    {event.title}
                    {event.status === 'cancelled' && (
                      <span className={styles.cancelBadge}>Otkazano</span>
                    )}
                  </div>

                  {/* Sprat */}
                  {floorLabel && (
                    <div className={styles.mobileFloorRow}>
                      <span className={styles.floorBadge}>{floorLabel}</span>
                    </div>
                  )}

                  {/* Izvođač */}
                  <div className={styles.mobilePerformer}>👤 {event.performer}</div>

                  {/* Rezervacije + cena */}
                  <div className={styles.mobileCardBottom}>
                    <span className={styles.mobileResWrap}>
                      👥 Rezervacije: <span className={styles.resBadge}>{resCount}</span>
                    </span>
                    <span className={styles.priceBadge}>{Number(event.price).toLocaleString('sr-RS')} RSD</span>
                  </div>

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
