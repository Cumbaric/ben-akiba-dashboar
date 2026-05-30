import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>

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
          <div className={styles.dividerText}>Izaberi događaj</div>
          <div className={styles.dividerLine} />
        </div>

        {/* Cards */}
        <div className={styles.cards}>

          {/* Stand Up */}
          <Link href="/standup" className={`${styles.card} ${styles.cardStandup}`}>
            <div className={`${styles.cardIcon} ${styles.cardIconStandup}`}>🎤</div>
            <div className={styles.cardTitle}>Stand Up</div>
            <div className={`${styles.cardSub} ${styles.cardSubStandup}`}>
              Pogledaj<br />repertoar
            </div>
            <div className={`${styles.cardArrow} ${styles.cardArrowStandup}`}>→</div>
          </Link>

          {/* Žurka */}
          <Link href="/zurke" className={`${styles.card} ${styles.cardZurka}`}>
            <div className={`${styles.cardIcon} ${styles.cardIconZurka}`}>🪩</div>
            <div className={styles.cardTitle}>Žurka</div>
            <div className={`${styles.cardSub} ${styles.cardSubZurka}`}>
              Pogledaj<br />repertoar
            </div>
            <div className={`${styles.cardArrow} ${styles.cardArrowZurka}`}>→</div>
          </Link>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className={styles.footer}>
        Ben Akiba &nbsp;·&nbsp; Belgrade &nbsp;·&nbsp; Good Vibes Only
      </div>

    </div>
  )
}
