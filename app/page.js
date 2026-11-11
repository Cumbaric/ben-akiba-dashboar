import Link from 'next/link'
import AdminBar from './AdminBar'
import { todayBelgrade } from '@/lib/sortEvents'
import { monthLabel, parseMonthKey, shiftMonth } from '@/lib/months'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

const MONTH_ICONS = ['❄️', '💘', '🌱', '🌷', '🌸', '☀️', '🏖️', '🌅', '🍇', '🍁', '🌙', '⛄']
const VARIANTS = [
  { card: styles.cardStandup, icon: styles.cardIconStandup, sub: styles.cardSubStandup, arrow: styles.cardArrowStandup },
  { card: styles.cardZurka, icon: styles.cardIconZurka, sub: styles.cardSubZurka, arrow: styles.cardArrowZurka },
  { card: styles.cardPurple, icon: styles.cardIconPurple, sub: styles.cardSubPurple, arrow: styles.cardArrowPurple },
]

export default function Home() {
  const currentKey = todayBelgrade().slice(0, 7)
  const keys = [shiftMonth(currentKey, -1), currentKey, shiftMonth(currentKey, 1)]

  return (
    <div className={styles.page}>
      <AdminBar />

      {/* ── BACKGROUND LIGHTS ── */}
      <div className={styles.bg}>
        <div className={styles.bgLight} />
        <div className={styles.bgLight} />
        <div className={styles.bgLight} />
        <div className={styles.bgLight} />
        <div className={styles.bgLight} />
        <div className={styles.bgLight} />
        <div className={styles.bgGlow} />
        <div className={styles.bgGlow} />
      </div>

      {/* ── CONTENT ── */}
      <div className={styles.content}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <img src="/logo-transparent.png" alt="Ben Akiba" className={styles.logoImg} />
          <div className={styles.logoSub}>
            Comedy Club &amp; Bar<br />White Lounge &amp; Art Gallery
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <div className={styles.dividerText}>Izaberi mesec</div>
          <div className={styles.dividerLine} />
        </div>

        {/* Month cards */}
        <div className={`${styles.cards} ${styles.cardsMonths}`}>
          {keys.map((k, i) => {
            const { month } = parseMonthKey(k)
            const v = VARIANTS[i]
            return (
              <Link key={k} href={`/mesec/${k}`} className={`${styles.card} ${v.card}`}>
                {k === currentKey && <span className={styles.currentTag}>Tekući</span>}
                <div className={`${styles.cardIcon} ${v.icon}`}>{MONTH_ICONS[month - 1]}</div>
                <div className={styles.cardTitle}>{monthLabel(k)}</div>
                <div className={`${styles.cardSub} ${v.sub}`}>
                  Pogledaj<br />repertoar
                </div>
                <div className={`${styles.cardArrow} ${v.arrow}`}>→</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className={styles.footer}>
        Ben Akiba &nbsp;·&nbsp; Belgrade &nbsp;·&nbsp; Good Vibes Only
      </div>

    </div>
  )
}
