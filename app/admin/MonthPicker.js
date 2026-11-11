import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { todayBelgrade } from '@/lib/sortEvents'
import { monthKey, monthLabel, parseMonthKey, shiftMonth } from '@/lib/months'
import styles from './months.module.css'

const MONTH_ICONS = ['❄️', '💘', '🌱', '🌷', '🌸', '☀️', '🏖️', '🌅', '🍇', '🍁', '🌙', '⛄']
const COLORS = ['pink', 'cyan', 'purple']
const TYPE_ICON = { standup: '🎤', zurka: '🎉' }

function MonthCard({ k, stat, types, hrefBase, current }) {
  const { month, year } = parseMonthKey(k)
  const color = COLORS[(month - 1) % 3]
  return (
    <Link href={`${hrefBase}/${k}`} className={`${styles.card} ${styles[color]}`}>
      {current && <span className={styles.currentTag}>Tekući</span>}
      <div className={styles.cardIcon}>{MONTH_ICONS[month - 1]}</div>
      <div className={styles.cardTitle}>{monthLabel(k)}</div>
      <div className={styles.cardYear}>{year}</div>
      <div className={styles.cardCounts}>
        {types.map(t => (
          <span key={t}>{TYPE_ICON[t]} {stat[t]}</span>
        ))}
      </div>
      <div className={styles.cardSub}>Pogledaj<br />događaje</div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  )
}

// Izbor meseca: prošli, tekući i sledeći mesec; stariji idu u Arhivu,
// a udaljeniji budući meseci (ako imaju događaje) u "Kasnije".
// types: koje tipove događaja brojimo/prikazujemo ('standup', 'zurka').
// hrefBase: kuda vodi kartica (hrefBase + '/' + 'YYYY-MM').
export default async function MonthPicker({ types, hrefBase }) {
  const { data } = await supabase.from('events').select('date, event_type')

  const currentKey = todayBelgrade().slice(0, 7)
  const prevKey = shiftMonth(currentKey, -1)
  const nextKey = shiftMonth(currentKey, 1)
  const picker = [prevKey, currentKey, nextKey]

  const stats = {}
  const ensure = k => (stats[k] ??= { standup: 0, zurka: 0 })
  for (const k of picker) ensure(k)
  for (const e of data ?? []) {
    const type = e.event_type === 'zurka' ? 'zurka' : 'standup'
    if (!types.includes(type)) continue
    const k = monthKey(e.date)
    if (!parseMonthKey(k)) continue
    ensure(k)[type]++
  }

  const keys = Object.keys(stats).sort()
  const archive = keys.filter(k => k < prevKey).reverse()
  const later = keys.filter(k => k > nextKey)

  const section = (title, list, first = false) => (
    <>
      <div className={styles.divider} style={first ? undefined : { marginTop: 48 }}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerText}>{title}</div>
        <div className={styles.dividerLine} />
      </div>
      <div className={styles.cards}>
        {list.map(k => (
          <MonthCard key={k} k={k} stat={stats[k]} types={types} hrefBase={hrefBase} current={k === currentKey} />
        ))}
      </div>
    </>
  )

  return (
    <div className={styles.wrap}>
      {section('Izaberi mesec', picker, true)}

      {later.length > 0 && section('Kasnije', later)}

      <div className={styles.divider} style={{ marginTop: 48 }}>
        <div className={styles.dividerLine} />
        <div className={styles.dividerText}>Arhiva</div>
        <div className={styles.dividerLine} />
      </div>
      {archive.length > 0 ? (
        <div className={styles.cards}>
          {archive.map(k => (
            <MonthCard key={k} k={k} stat={stats[k]} types={types} hrefBase={hrefBase} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Nema starijih meseci. Meseci ispred prošlog ulaze ovde.
        </div>
      )}
    </div>
  )
}
