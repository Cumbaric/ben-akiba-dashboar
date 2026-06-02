'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './admin.module.css'

const FLOOR_OPTIONS = [
  { value: 'ground_floor', label: 'Ground Floor (dole)' },
  { value: 'white_lounge', label: 'White Lounge (gore)' },
  { value: 'after', label: 'After' },
]

function emptyFloor() {
  return { floor: 'ground_floor', performer: '', price: '', time: '22:00', capacity: 120 }
}

export default function ZurkaForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [floors, setFloors] = useState([emptyFloor()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setFloor(i, key, value) {
    setFloors(fs => fs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)))
  }

  function addFloor() {
    // predloži sprat koji još nije izabran
    const used = floors.map(f => f.floor)
    const next = FLOOR_OPTIONS.find(o => !used.includes(o.value))
    setFloors(fs => [...fs, { ...emptyFloor(), floor: next ? next.value : 'after' }])
  }

  function removeFloor(i) {
    setFloors(fs => fs.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!date) return setError('Izaberi datum žurke.')
    for (const f of floors) {
      if (!f.performer.trim()) return setError('Unesi izvođača za svaki sprat.')
      if (f.price === '' || f.price === null) return setError('Unesi cenu za svaki sprat.')
      if (!f.time) return setError('Unesi vreme za svaki sprat.')
    }

    setLoading(true)
    const payload = floors.map(f => ({
      title: title.trim() || 'Žurka',
      performer: f.performer.trim(),
      price: Number(f.price) || 0,
      time: f.time,
      date,
      capacity: parseInt(f.capacity, 10) || 0,
      event_type: 'zurka',
      floor: f.floor,
      status: 'active',
    }))

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/zurke')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Greška pri čuvanju')
      setLoading(false)
    }
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          <div className={styles.sectionTitle}>Informacije o žurki</div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Naziv žurke</label>
            <input
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="npr. Saturday Night"
            />
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Datum *</label>
            <input
              className={styles.input}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          {floors.map((f, i) => (
            <div key={i} className={`${styles.floorBlock} ${styles.fullWidth}`}>
              <div className={styles.floorBlockHeader}>
                <span className={styles.floorBlockTitle}>🏢 Sprat {i + 1}</span>
                {floors.length > 1 && (
                  <button type="button" className={styles.removeFloorBtn} onClick={() => removeFloor(i)}>
                    ✕ Ukloni
                  </button>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Sprat *</label>
                  <select
                    className={styles.select}
                    value={f.floor}
                    onChange={e => setFloor(i, 'floor', e.target.value)}
                  >
                    {FLOOR_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label className={styles.label}>Izvođač *</label>
                  <input
                    className={styles.input}
                    value={f.performer}
                    onChange={e => setFloor(i, 'performer', e.target.value)}
                    placeholder="npr. DJ Marko"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Cena karte (RSD) *</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    value={f.price}
                    onChange={e => setFloor(i, 'price', e.target.value)}
                    placeholder="800"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Vreme početka *</label>
                  <input
                    className={styles.input}
                    type="time"
                    value={f.time}
                    onChange={e => setFloor(i, 'time', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Kapacitet</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    value={f.capacity}
                    onChange={e => setFloor(i, 'capacity', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className={styles.fullWidth}>
            <button type="button" className={styles.addFloorBtn} onClick={addFloor}>
              + Dodaj sprat
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              {loading ? 'Čuvanje...' : '✅ Kreiraj žurku'}
            </button>
            <button
              className={styles.btnSecondary}
              type="button"
              onClick={() => router.push('/admin/zurke')}
            >
              Otkaži
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
