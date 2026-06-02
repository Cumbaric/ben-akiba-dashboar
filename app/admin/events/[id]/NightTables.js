'use client'

import { useRouter } from 'next/navigation'
import { ZurkaSection, SECTIONS } from './ZurkaTables'
import styles from './event.module.css'

export default function NightTables({ events, reservations }) {
  const router = useRouter()
  function refresh() { router.refresh() }

  // Sortiraj spratove po redosledu SECTIONS (ground -> white -> after)
  const order = SECTIONS.map(s => s.key)
  const sorted = [...events].sort((a, b) => order.indexOf(a.floor) - order.indexOf(b.floor))

  const totalAll = reservations.reduce((s, r) => s + (r.num_people || 0), 0)

  return (
    <div>
      {/* Sažetak po spratu + ukupno */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryGrid}>
          {sorted.map(ev => {
            const section = SECTIONS.find(s => s.key === ev.floor)
            const rows = reservations.filter(r => r.event_id === ev.id)
            const total = rows.reduce((s, r) => s + (r.num_people || 0), 0)
            return (
              <div key={ev.id} className={styles.summaryItem}>
                <div className={styles.summaryLabel}>{section ? section.label : ev.floor}</div>
                <div className={styles.summaryValue} style={{ color: section ? section.color : 'var(--purple)' }}>{total}</div>
              </div>
            )
          })}
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Ukupno (cela večer)</div>
            <div className={styles.summaryValue} style={{ color: 'var(--pink)' }}>{totalAll}</div>
          </div>
        </div>
      </div>

      {/* Po jedan blok rezervacija za svaki sprat */}
      <div className={styles.zurkaGrid}>
        {sorted.map(ev => {
          const section = SECTIONS.find(s => s.key === ev.floor)
            || { key: ev.floor, label: ev.floor, color: 'var(--purple)' }
          const rows = reservations.filter(r => r.event_id === ev.id)
          return (
            <ZurkaSection
              key={ev.id}
              section={section}
              rows={rows}
              event={ev}
              onRefresh={refresh}
            />
          )
        })}
      </div>
    </div>
  )
}
