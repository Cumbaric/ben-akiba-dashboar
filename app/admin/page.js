import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { todayBelgrade } from '@/lib/sortEvents'
import { monthKey, monthLabel, parseMonthKey } from '@/lib/months'
import styles from './months.module.css'

export const revalidate = 0

const MONTH_ICONS = ['❄️', '💘', '🌱', '🌷', '🌸', '☀️', '🏖️', '🌅', '🍇', '🍁', '🌙', '⛄']
const COLORS = ['pink', 'cyan', 'purple']

function MonthCard({ k, stat, current }) {
  const { month, year } = parseMonthKey(k)
  const color = COLORS[(month - 1) % 3]
  return (
    <Link href={`/admin/mesec/${k}`} className={`${styles.card} ${styles[color]}`}>
      {current && <span className={styles.currentTag}>Tekući</span>}
      <div className={styles.cardIcon}>{MONTH_ICONS[month - 1]}</div>
      <div className={styles.cardTitle}>{monthLabel(k)}</div>
      <div className={styles.cardYear}>{year}</div>
      <div className={styles.cardCounts}>
        <span>🎤 {stat.standup}</span>
        <span>🎉 {stat.zurka}</span>
      </div>
      <div className={styles.cardSub}>Pogledaj<br />događaje</div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  )
}

export default async function AdminHome() {
  const { data } = await supabase.from('events').select('date, event_type')

  const today = todayBelgrade()
  const currentKey = today.slice(0, 7)

  const stats = {}
  for (const e of data ?? []) {
    const k = monthKey(e.date)
    if (!parseMonthKey(k)) continue
    if (!stats[k]) stats[k] = { standup: 0, zurka: 0 }
    if (e.event_type === 'zurka') stats[k].zurka++
    else stats[k].standup++
  }

  // Izbor meseca: prošli, tekući i sledeći (uvek prikazani, čak i prazni)
  const shift = (key, delta) => {
    const { year, month } = parseMonthKey(key)
    const d = new Date(Date.UTC(year, month - 1 + delta, 1))
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
  }
  const prevKey = shift(currentKey, -1)
  const nextKey = shift(currentKey, 1)
  const picker = [prevKey, currentKey, nextKey]
  for (const k of picker) if (!stats[k]) stats[k] = { standup: 0, zurka: 0 }

  const keys = Object.keys(stats).sort()
  const archive = keys.filter(k => k < prevKey).reverse() // stariji meseci, najskoriji prvi
  const later = keys.filter(k => k > nextKey) // udaljeniji budući meseci (ako imaju događaje)

  return (
    <div className={styles.wrap}>
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerText}>Izaberi mesec</div>
        <div className={styles.dividerLine} />
      </div>

      <div className={styles.cards}>
        {picker.map(k => (
          <MonthCard key={k} k={k} stat={stats[k]} current={k === currentKey} />
        ))}
      </div>

      {later.length > 0 && (
        <>
          <div className={styles.divider} style={{ marginTop: 48 }}>
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>Kasnije</div>
            <div className={styles.dividerLine} />
          </div>
          <div className={styles.cards}>
            {later.map(k => (
              <MonthCard key={k} k={k} stat={stats[k]} />
            ))}
          </div>
        </>
      )}

      <div className={styles.divider} style={{ marginTop: 48 }}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerText}>Arhiva</div>
        <div className={styles.dividerLine} />
      </div>
      {archive.length > 0 ? (
        <div className={styles.cards}>
          {archive.map(k => (
            <MonthCard key={k} k={k} stat={stats[k]} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Nema starijih meseci. Meseci ispred prošlog ulaze ovde.
        </div>
      )}

      <div className={styles.quickLinks}>
        <Link href="/admin/standup">🎤 Svi Stand Up</Link>
        <Link href="/admin/zurke">🎉 Sve Žurke</Link>
      </div>
    </div>
  )
}
