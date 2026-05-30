import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return {
    day: DAY_NAMES[d.getDay()],
    date: `${String(d.getDate()).padStart(2, '0')}.${MONTH_NAMES[d.getMonth()]}.`,
  }
}

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <div className={styles.logoText}>Ben Akiba</div>
          <div className={styles.logoSub}>
            Comedy Club &amp; Bar<br />White Lounge &amp; Art Gallery
          </div>
        </div>

        <div className={styles.standupBadge}>
          <div className={styles.standupRow}>
            <div className={styles.standupIcon}>🎤</div>
            <div className={styles.standupTitle}>Stand Up</div>
          </div>
          <div className={styles.standupSub}>Repertoar</div>
        </div>
      </header>

      {/* ── TABLE ── */}
      <main className={styles.container}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>📅 Datum</th>
                <th>🕐 Vreme</th>
                <th>🎭 Predstava</th>
                <th>👤 Izvođač</th>
                <th>🎟 Cena</th>
              </tr>
            </thead>
            <tbody>
              {!events || events.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Nema zakazanih događaja.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const { day, date } = formatDate(event.date)
                  return (
                    <tr
                      key={event.id}
                      className={event.status === 'cancelled' ? styles.cancelled : ''}
                    >
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

        {/* ── CTA ── */}
        <div className={styles.cta}>
          <button className={styles.ctaBtn}>
            📅 Pregledaj ceo repertoar
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footerNote}>
          Ben Akiba &nbsp;·&nbsp; Belgrade &nbsp;·&nbsp; Good Vibes Only
        </div>
      </main>

    </div>
  )
}
