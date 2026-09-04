'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styles from './event.module.css'

const SECTIONS = [
  { key: 'tickets', label: 'tickets.rs', color: 'var(--pink)' },
  { key: 'phone', label: 'Telefonom', color: 'var(--blue)' },
  { key: 'free', label: 'Free', color: 'var(--green)' },
  { key: 'waitlist', label: 'Lista čekanja', color: 'var(--yellow)' },
]

function ReservationRow({ row, onUpdate, onDelete, runningTotal }) {
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

  function toggleConfirm() {
    startTransition(async () => {
      await fetch(`/api/reservations/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: !row.confirmed }),
      })
      onUpdate()
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
        <td><input className={styles.inlineInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ime i prezime" autoFocus /></td>
        <td><input className={styles.inlineInput} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" /></td>
        <td><input className={styles.inlineInput} type="number" min="1" value={form.num_people} onChange={e => setForm(f => ({ ...f, num_people: parseInt(e.target.value) || 1 }))} style={{ width: 60 }} /></td>
        <td></td>
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
    <tr className={row.confirmed ? styles.confirmedRow : ''}>
      <td className={styles.nameCell} onClick={() => setEditing(true)}>{row.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
      <td className={styles.phoneCell} onClick={() => setEditing(true)}>{row.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
      <td className={styles.numCell} onClick={() => setEditing(true)}>{row.num_people}</td>
      <td>
        <button
          className={row.confirmed ? styles.confirmedBtn : styles.notConfirmedBtn}
          onClick={toggleConfirm}
          disabled={isPending}
          title={row.confirmed ? 'Potvrđeno' : 'Nije potvrđeno'}
        >
          {row.confirmed ? '+' : '○'}
        </button>
      </td>
      <td className={styles.totalCell} style={{ color: runningTotal < 0 ? 'var(--red)' : runningTotal <= 5 ? 'var(--yellow)' : 'var(--text-primary)' }}>
        {runningTotal}
      </td>
      <td>
        <button className={styles.deleteSmBtn} onClick={del} disabled={isPending}>🗑</button>
      </td>
    </tr>
  )
}

function SectionTable({ section, rows, capacity, eventId, onRefresh }) {
  const [newRow, setNewRow] = useState({ name: '', phone: '', num_people: 1 })
  const [adding, setAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalPeople = rows.reduce((s, r) => s + (r.num_people || 0), 0)
  const confirmedPeople = rows.filter(r => r.confirmed).reduce((s, r) => s + (r.num_people || 0), 0)

  // running totals per row (cumulative subtraction from capacity)
  let running = capacity
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
          event_id: eventId,
          section: section.key,
          name: newRow.name,
          phone: newRow.phone,
          num_people: newRow.num_people,
          confirmed: false,
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
      <div className={styles.sectionHeader} style={{ borderColor: section.color }}>
        <div className={styles.sectionTitle} style={{ color: section.color }}>{section.label}</div>
        <div className={styles.sectionStats}>
          <span className={styles.statPill} style={{ color: section.color }}>{totalPeople} osoba</span>
          <span className={styles.statPill} style={{ color: 'var(--green)' }}>{confirmedPeople} potvrđeno</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.resTable}>
          <thead>
            <tr>
              <th>Ime i prezime</th>
              <th>Telefon</th>
              <th>Br. osoba</th>
              <th>+</th>
              <th>Slobodno</th>
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
                onDelete={onRefresh}
              />
            ))}
            {adding ? (
              <tr className={styles.addingRow}>
                <td><input className={styles.inlineInput} value={newRow.name} onChange={e => setNewRow(f => ({ ...f, name: e.target.value }))} placeholder="Ime i prezime" autoFocus /></td>
                <td><input className={styles.inlineInput} value={newRow.phone} onChange={e => setNewRow(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" /></td>
                <td><input className={styles.inlineInput} type="number" min="1" value={newRow.num_people} onChange={e => setNewRow(f => ({ ...f, num_people: parseInt(e.target.value) || 1 }))} style={{ width: 60 }} /></td>
                <td></td>
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
                <td colSpan={6}>
                  <button className={styles.addRowBtn} onClick={() => setAdding(true)}>+ Dodaj rezervaciju</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function StandupTables({ event, reservations }) {
  const router = useRouter()

  function refresh() {
    router.refresh()
  }

  // Summary stats
  const ticketsRows = reservations.filter(r => r.section === 'tickets')
  const phoneRows = reservations.filter(r => r.section === 'phone')
  const freeRows = reservations.filter(r => r.section === 'free')
  const waitlistRows = reservations.filter(r => r.section === 'waitlist')

  const totalTickets = ticketsRows.reduce((s, r) => s + (r.num_people || 0), 0)
  const totalPhone = phoneRows.reduce((s, r) => s + (r.num_people || 0), 0)
  const totalFree = freeRows.reduce((s, r) => s + (r.num_people || 0), 0)
  const totalWaitlist = waitlistRows.reduce((s, r) => s + (r.num_people || 0), 0)
  const totalAll = totalTickets + totalPhone + totalFree
  const totalConfirmed = reservations
    .filter(r => r.confirmed && r.section !== 'waitlist')
    .reduce((s, r) => s + (r.num_people || 0), 0)

  return (
    <div>
      {/* Summary header */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Sve rezervacije</div>
            <div className={styles.summaryValue} style={{ color: 'var(--pink)' }}>{totalAll}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>tickets.rs</div>
            <div className={styles.summaryValue} style={{ color: 'var(--pink)' }}>{totalTickets}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Telefonom</div>
            <div className={styles.summaryValue} style={{ color: 'var(--blue)' }}>{totalPhone}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Free</div>
            <div className={styles.summaryValue} style={{ color: 'var(--green)' }}>{totalFree}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Potvrđeno</div>
            <div className={styles.summaryValue} style={{ color: 'var(--yellow)' }}>{totalConfirmed}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Lista čekanja</div>
            <div className={styles.summaryValue} style={{ color: 'var(--purple)' }}>{totalWaitlist}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Kapacitet</div>
            <div className={styles.summaryValue}>{event.capacity}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Slobodnih mesta</div>
            <div className={styles.summaryValue} style={{ color: event.capacity - totalAll < 10 ? 'var(--red)' : 'var(--green)' }}>
              {event.capacity - totalAll}
            </div>
          </div>
        </div>
      </div>

      {/* 4 section tables */}
      <div className={styles.tablesGrid}>
        {SECTIONS.map(section => {
          const rows = reservations.filter(r => r.section === section.key)
          return (
            <SectionTable
              key={section.key}
              section={section}
              rows={rows}
              capacity={event.capacity}
              eventId={event.id}
              onRefresh={refresh}
            />
          )
        })}
      </div>
    </div>
  )
}
