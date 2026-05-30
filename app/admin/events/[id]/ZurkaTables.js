'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styles from './event.module.css'

const SECTIONS = [
  { key: 'ground_floor', label: 'GROUND FLOOR (dole)', color: 'var(--green)' },
  { key: 'white_lounge', label: 'WHITE LOUNGE (gore)', color: 'var(--yellow)' },
  { key: 'after', label: 'AFTER', color: 'var(--purple)' },
]

function ReservationRow({ row, onUpdate, runningTotal }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: row.name || '', phone: row.phone || '', num_people: row.num_people || 1 })
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await fetch(`/api/reservations/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      onUpdate()
      setEditing(false)
    })
  }

  function del() {
    startTransition(async () => {
      await fetch(`/api/reservations/${row.id}`, { method: 'DELETE' })
      onUpdate()
    })
  }

  if (editing) {
    return (
      <tr className={styles.editingRow}>
        <td><input className={styles.inlineInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ime" autoFocus /></td>
        <td><input className={styles.inlineInput} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" /></td>
        <td><input className={styles.inlineInput} type="number" min="1" value={form.num_people} onChange={e => setForm(f => ({ ...f, num_people: parseInt(e.target.value) || 1 }))} style={{ width: 60 }} /></td>
        <td style={{ color: 'var(--text-secondary)' }}>{runningTotal}</td>
        <td>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={styles.confirmBtn} onClick={save} disabled={isPending}>✓</button>
            <button className={styles.cancelSmBtn} onClick={() => setEditing(false)}>✕</button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className={styles.nameCell} onClick={() => setEditing(true)}>{row.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
      <td className={styles.phoneCell} onClick={() => setEditing(true)}>{row.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
      <td className={styles.numCell} onClick={() => setEditing(true)}>{row.num_people}</td>
      <td className={styles.totalCell} style={{ color: runningTotal < 0 ? 'var(--red)' : runningTotal <= 5 ? 'var(--yellow)' : 'var(--text-primary)' }}>
        {runningTotal}
      </td>
      <td>
        <button className={styles.deleteSmBtn} onClick={del} disabled={isPending}>🗑</button>
      </td>
    </tr>
  )
}

function ZurkaSection({ section, rows, event, onRefresh }) {
  const [newRow, setNewRow] = useState({ name: '', phone: '', num_people: 1 })
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalPeople = rows.reduce((s, r) => s + (r.num_people || 0), 0)

  let running = event.capacity
  const runningTotals = rows.map(r => {
    running -= (r.num_people || 0)
    return running
  })

  function addRow() {
    if (!newRow.name && !newRow.phone) return
    startTransition(async () => {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          section: section.key,
          name: newRow.name,
          phone: newRow.phone,
          num_people: newRow.num_people,
          sort_order: rows.length,
        }),
      })
      setNewRow({ name: '', phone: '', num_people: 1 })
      setAdding(false)
      onRefresh()
    })
  }

  return (
    <div className={styles.sectionBlock}>
      {/* Section header */}
      <div className={styles.zurkaSectionHeader} style={{ borderColor: section.color, background: `${section.color}10` }}>
        <div className={styles.sectionTitle} style={{ color: section.color }}>{section.label}</div>
        <div className={styles.sectionMeta}>
          <span>{event.performer}</span>
          <span>·</span>
          <span>{new Date(event.date).toLocaleDateString('sr-RS')}</span>
          <span>·</span>
          <span>{event.time}</span>
          {event.price && <><span>·</span><span style={{ color: 'var(--purple)' }}>{Number(event.price).toLocaleString('sr-RS')} din.</span></>}
        </div>
        <div className={styles.sectionStats}>
          <span className={styles.statPill} style={{ color: section.color }}>{totalPeople} osoba</span>
        </div>
      </div>

      <table className={styles.resTable}>
        <thead>
          <tr>
            <th>Ime</th>
            <th>Telefon</th>
            <th>Br. osoba</th>
            <th>Rezervacije</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <ReservationRow
              key={row.id}
              row={row}
              runningTotal={runningTotals[i]}
              onUpdate={onRefresh}
            />
          ))}
          {adding ? (
            <tr className={styles.addingRow}>
              <td><input className={styles.inlineInput} value={newRow.name} onChange={e => setNewRow(f => ({ ...f, name: e.target.value }))} placeholder="Ime" autoFocus /></td>
              <td><input className={styles.inlineInput} value={newRow.phone} onChange={e => setNewRow(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" /></td>
              <td><input className={styles.inlineInput} type="number" min="1" value={newRow.num_people} onChange={e => setNewRow(f => ({ ...f, num_people: parseInt(e.target.value) || 1 }))} style={{ width: 60 }} /></td>
              <td></td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={styles.confirmBtn} onClick={addRow} disabled={isPending}>✓</button>
                  <button className={styles.cancelSmBtn} onClick={() => setAdding(false)}>✕</button>
                </div>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={5}>
                <button className={styles.addRowBtn} onClick={() => setAdding(true)}>+ Dodaj rezervaciju</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function ZurkaTables({ event, reservations }) {
  const router = useRouter()
  function refresh() { router.refresh() }

  return (
    <div>
      <div className={styles.summaryCard}>
        <div className={styles.summaryGrid}>
          {SECTIONS.map(s => {
            const rows = reservations.filter(r => r.section === s.key)
            const total = rows.reduce((sum, r) => sum + (r.num_people || 0), 0)
            return (
              <div key={s.key} className={styles.summaryItem}>
                <div className={styles.summaryLabel}>{s.label}</div>
                <div className={styles.summaryValue} style={{ color: s.color }}>{total}</div>
              </div>
            )
          })}
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Ukupno</div>
            <div className={styles.summaryValue} style={{ color: 'var(--pink)' }}>
              {reservations.reduce((s, r) => s + (r.num_people || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.zurkaGrid}>
        {SECTIONS.map(section => (
          <ZurkaSection
            key={section.key}
            section={section}
            rows={reservations.filter(r => r.section === section.key)}
            event={event}
            onRefresh={refresh}
          />
        ))}
      </div>
    </div>
  )
}
