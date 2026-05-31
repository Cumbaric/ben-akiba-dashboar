import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import styles from './standup.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['01','02','03','04','05','06','07','08','09','10','11','12']

export const dynamic = 'force-dynamic'

export default async function StandupPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', 'standup')
    .order('date', { ascending: true })

  // Dohvati rezervacije za statistiku po eventu
  const { data: reservations } = await supabase
    .from('reservations')
    .select('event_id, section, num_people, confirmed')

  // Agregacija: TC (tickets), TL (telefonom), FR (free), PV (potvrđeni). UK = TC + TL + FR
  const stats = {}
  if (reservations) {
    reservations.forEach(r => {
      if (!stats[r.event_id]) stats[r.event_id] = { tc: 0, tl: 0, fr: 0, pv: 0 }
      const n = r.num_people || 0
      if (r.section === 'tickets') stats[r.event_id].tc += n
      if (r.section === 'phone') stats[r.event_id].tl += n
      if (r.section === 'free') stats[r.event_id].fr += n
      if (r.confirmed && r.section !== 'waitlist') stats[r.event_id].pv += n
    })
  }

  function getStats(id) {
    const s = stats[id] || { tc: 0, tl: 0, fr: 0, pv: 0 }
    return { ...s, uk: s.tc + s.tl + s.fr }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>← Nazad</Link>

        <div className={styles.logoWrap}>
          <img src="/logo-transparent.png" alt="Ben Akiba" className={styles.logoImg} />
          <div className={styles.logoSub}>Comedy Club &amp; Bar · White Lounge &amp; Art Gallery</div>
        </div>

        <div className={styles.standupBadge}>
          <div className={styles.standupRow}>
            <div className={styles.standupIcon}>🎤</div>
            <div className={styles.standupTitle}>Stand Up</div>
          </div>
          <div className={styles.standupSub}>Repertoar</div>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>📅 Datum</th>
                <th>🕐 Vreme</th>
                <th>🎭 Predstava</th>
                <th>👤 Izvođač</th>
                <th className={`${styles.statTh} ${styles.statTc}`} title="tickets.rs">TC</th>
                <th className={`${styles.statTh} ${styles.statTl}`} title="Telefonom">TL</th>
                <th className={`${styles.statTh} ${styles.statFr}`} title="Free karte">FR</th>
                <th className={`${styles.statTh} ${styles.statUk}`} title="Ukupno (tickets + telefonom + free)">UK</th>
                <th className={`${styles.statTh} ${styles.statPv}`} title="Potvrđeni">PV</th>
                <th>🎟 Cena</th>
              </tr>
            </thead>
            <tbody>
              {!events || events.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.emptyState}>
                    Nema zakazanih stand-up događaja.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const d = new Date(event.date)
                  const day = DAY_NAMES[d.getDay()]
                  const date = `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.`
                  const s = getStats(event.id)
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
                        <div className={styles.showCell}>
                          <span className={styles.showName}>{event.title}</span>
                          {event.status === 'cancelled' && (
                            <span className={styles.cancelBadge}>Otkazano</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.performerCell}>{event.performer}</td>
                      <td className={`${styles.statTd} ${styles.statTc}`}>{s.tc}</td>
                      <td className={`${styles.statTd} ${styles.statTl}`}>{s.tl}</td>
                      <td className={`${styles.statTd} ${styles.statFr}`}>{s.fr}</td>
                      <td className={`${styles.statTd} ${styles.statUk}`}>{s.uk}</td>
                      <td className={`${styles.statTd} ${styles.statPv}`}>{s.pv}</td>
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
            <div className={styles.emptyState}>Nema zakazanih stand-up događaja.</div>
          ) : (
            events.map((event) => {
              const d = new Date(event.date)
              const day = DAY_NAMES[d.getDay()]
              const date = `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.`
              const s = getStats(event.id)
              return (
                <div key={event.id} className={`${styles.mobileCard} ${event.status === 'cancelled' ? styles.cancelled : ''}`}>
                  <div className={styles.mobileCardTop}>
                    <div className={styles.mobileDate}>
                      <span className={styles.mobileDayName}>{day}</span>
                      <span className={styles.mobileDateNum}>{date}</span>
                    </div>
                    <div className={styles.mobileInfo}>
                      <div className={styles.mobileTitle}>
                        {event.title}
                        {event.status === 'cancelled' && (
                          <span className={styles.cancelBadge} style={{ marginLeft: 8 }}>Otkazano</span>
                        )}
                      </div>
                      <div className={styles.mobilePerformer}>{event.performer}</div>
                    </div>
                  </div>

                  <div className={styles.mobileStats}>
                    <span className={`${styles.mobileStat} ${styles.statTc}`}><b>TC</b> {s.tc}</span>
                    <span className={`${styles.mobileStat} ${styles.statTl}`}><b>TL</b> {s.tl}</span>
                    <span className={`${styles.mobileStat} ${styles.statFr}`}><b>FR</b> {s.fr}</span>
                    <span className={`${styles.mobileStat} ${styles.statUk}`}><b>UK</b> {s.uk}</span>
                    <span className={`${styles.mobileStat} ${styles.statPv}`}><b>PV</b> {s.pv}</span>
                  </div>

                  <div className={styles.mobileCardBottom}>
                    <span className={styles.mobileTime}>🕐 {event.time}</span>
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
