import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>← Nazad</Link>

        <div className={styles.logoWrap}>
          <Image src="/logo.png" alt="Ben Akiba" width={200} height={86} className={styles.logoImg} priority />
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
                <th>🎟 Cena</th>
              </tr>
            </thead>
            <tbody>
              {!events || events.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Nema zakazanih stand-up događaja.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const d = new Date(event.date)
                  const day = DAY_NAMES[d.getDay()]
                  const date = `${String(d.getDate()).padStart(2,'0')}.${MONTH_NAMES[d.getMonth()]}.`
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

        <div className={styles.footerNote}>
          Ben Akiba &nbsp;·&nbsp; Belgrade &nbsp;·&nbsp; Good Vibes Only
        </div>
      </main>
    </div>
  )
}
