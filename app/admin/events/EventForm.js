'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'

const EMPTY = {
  title: '',
  performer: '',
  date: '',
  time: '20:00',
  price: '',
  capacity: 120,
  sold: 0,
  reserved: 0,
  confirmed: 0,
  waitlist: 0,
  phone: '',
  note: '',
  status: 'active',
  event_type: 'standup',
}

export default function EventForm({ event }) {
  const router = useRouter()
  const isEdit = !!event
  const [form, setForm] = useState(event ? { ...EMPTY, ...event } : EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function numInput(key, value) {
    const n = parseInt(value, 10)
    set(key, isNaN(n) ? 0 : n)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = isEdit ? `/api/events/${event.id}` : '/api/events'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Greška pri čuvanju')
      setLoading(false)
    }
  }

  const freeSeats = (form.capacity || 0) - (form.sold || 0) - (form.reserved || 0)

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          <div className={`${styles.sectionTitle}`}>Informacije o događaju</div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Tip događaja *</label>
            <select
              className={styles.select}
              value={form.event_type}
              onChange={e => set('event_type', e.target.value)}
            >
              <option value="standup">🎤 Stand Up</option>
              <option value="zurka">🎉 Žurka</option>
            </select>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Naziv predstave *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="npr. Best of Srđan Olman"
              required
            />
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Izvođač *</label>
            <input
              className={styles.input}
              value={form.performer}
              onChange={e => set('performer', e.target.value)}
              placeholder="npr. Srđan Olman"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Datum *</label>
            <input
              className={styles.input}
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Vreme *</label>
            <input
              className={styles.input}
              type="time"
              value={form.time}
              onChange={e => set('time', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cena karte (RSD) *</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="1400"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ukupan kapacitet</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.capacity}
              onChange={e => numInput('capacity', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Telefon za rezervacije</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="060 123 4567"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="active">Aktivno</option>
              <option value="cancelled">Otkazano</option>
            </select>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.label}>Napomena</label>
            <input
              className={styles.input}
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder="Nema napomene"
            />
          </div>

          <div className={styles.sectionTitle}>Rezervacije</div>

          <div className={styles.field}>
            <label className={styles.label}>Prodato 🎟</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.sold}
              onChange={e => numInput('sold', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Rezervisano 📞</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.reserved}
              onChange={e => numInput('reserved', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Potvrđeno ✅</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.confirmed}
              onChange={e => numInput('confirmed', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Lista čekanja ⏳</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.waitlist}
              onChange={e => numInput('waitlist', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slobodnih mesta</label>
            <input
              className={styles.input}
              value={freeSeats < 0 ? 0 : freeSeats}
              readOnly
              style={{ color: 'var(--green)', cursor: 'default' }}
            />
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              {loading ? 'Čuvanje...' : isEdit ? '💾 Sačuvaj izmene' : '✅ Kreiraj događaj'}
            </button>
            <button
              className={styles.btnSecondary}
              type="button"
              onClick={() => router.push('/admin')}
            >
              Otkaži
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
