'use client'

import { useState } from 'react'
import styles from '../../admin.module.css'

const DAY_NAMES = ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota']
const DAY_SHORT = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

const STANDUP_SECTIONS = [
  { key: 'tickets', label: 'tickets.rs' },
  { key: 'phone', label: 'Telefonom' },
  { key: 'free', label: 'Free' },
  { key: 'waitlist', label: 'Lista čekanja' },
]

const ZURKA_SECTIONS = [
  { key: 'ground_floor', label: 'GROUND FLOOR (dole)' },
  { key: 'white_lounge', label: 'WHITE LOUNGE (gore)' },
  { key: 'after', label: 'AFTER' },
]

export default function DownloadPDF({ event, reservations }) {
  const [loading, setLoading] = useState(false)

  async function generatePDF() {
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const d = new Date(event.date)
      const dayShort = DAY_SHORT[d.getDay()]
      const dateStr = `${dayShort} ${String(d.getDate()).padStart(2, '0')}.${MONTH_NAMES[d.getMonth()]}.${d.getFullYear()}`

      // ---- Header ----
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('BEN AKIBA', 105, 18, { align: 'center' })

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Comedy Club & Bar', 105, 25, { align: 'center' })

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(event.title, 105, 35, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text(`${event.performer}   ·   ${dateStr}   ·   ${event.time}   ·   ${Number(event.price).toLocaleString('sr-RS')} RSD`, 105, 42, { align: 'center' })

      // divider line
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 46, 196, 46)

      const sections = event.event_type === 'standup' ? STANDUP_SECTIONS : ZURKA_SECTIONS
      let yPos = 52

      // ---- Summary row for standup ----
      if (event.event_type === 'standup') {
        const tickets = reservations.filter(r => r.section === 'tickets')
        const phone = reservations.filter(r => r.section === 'phone')
        const free = reservations.filter(r => r.section === 'free')
        const waitlist = reservations.filter(r => r.section === 'waitlist')
        const totalAll = [...tickets, ...phone, ...free].reduce((s, r) => s + (r.num_people || 0), 0)
        const totalConfirmed = [...tickets, ...phone, ...free].filter(r => r.confirmed).reduce((s, r) => s + (r.num_people || 0), 0)
        const totalWaitlist = waitlist.reduce((s, r) => s + (r.num_people || 0), 0)

        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)

        const summaryData = [
          ['SVE REZERVACIJE', 'TICKETS.RS', 'TELEFONOM', 'FREE', 'POTVRĐENO', 'LISTA ČEKANJA', 'KAPACITET', 'SLOBODNIH'],
          [
            String(totalAll),
            String(tickets.reduce((s, r) => s + (r.num_people || 0), 0)),
            String(phone.reduce((s, r) => s + (r.num_people || 0), 0)),
            String(free.reduce((s, r) => s + (r.num_people || 0), 0)),
            String(totalConfirmed),
            String(totalWaitlist),
            String(event.capacity),
            String(event.capacity - totalAll),
          ]
        ]

        autoTable(doc, {
          startY: yPos,
          head: [summaryData[0]],
          body: [summaryData[1]],
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 60], textColor: 255, fontSize: 7, halign: 'center', fontStyle: 'bold' },
          bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
          margin: { left: 14, right: 14 },
        })
        yPos = doc.lastAutoTable.finalY + 8
      }

      // ---- Sections ----
      for (const section of sections) {
        const rows = reservations.filter(r => r.section === section.key)
        const totalPeople = rows.reduce((s, r) => s + (r.num_people || 0), 0)

        // Section title
        if (yPos > 240) { doc.addPage(); yPos = 20 }

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(40, 40, 40)
        doc.text(`${section.label}   (${totalPeople} osoba)`, 14, yPos)
        yPos += 4

        if (rows.length === 0) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(150, 150, 150)
          doc.text('Nema rezervacija', 14, yPos + 5)
          yPos += 14
          continue
        }

        // Build table rows with running total
        let running = event.capacity
        const tableBody = rows.map((r, i) => {
          running -= (r.num_people || 0)
          const confirmed = event.event_type === 'standup'
            ? (r.confirmed ? '+' : '○')
            : null
          const row = [
            String(i + 1),
            r.name || '',
            r.phone || '',
            String(r.num_people || 1),
          ]
          if (event.event_type === 'standup') row.push(confirmed)
          row.push(String(running))
          return row
        })

        const head = event.event_type === 'standup'
          ? [['#', 'Ime i prezime', 'Telefon', 'Br. osoba', 'Potvrđeno', 'Slobodnih mesta']]
          : [['#', 'Ime', 'Telefon', 'Br. osoba', 'Rezervacije']]

        autoTable(doc, {
          startY: yPos,
          head,
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [60, 20, 80], textColor: 255, fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: event.event_type === 'standup' ? { cellWidth: 20, halign: 'center' } : { cellWidth: 25, halign: 'center' },
            5: event.event_type === 'standup' ? { cellWidth: 25, halign: 'center' } : undefined,
          },
          margin: { left: 14, right: 14 },
          didParseCell: (data) => {
            if (event.event_type === 'standup' && data.column.index === 4 && data.section === 'body') {
              if (data.cell.raw === '+') {
                data.cell.styles.textColor = [0, 180, 80]
                data.cell.styles.fontStyle = 'bold'
              }
            }
            // Red cells for negative running total
            const lastCol = event.event_type === 'standup' ? 5 : 4
            if (data.column.index === lastCol && data.section === 'body') {
              const val = parseInt(data.cell.raw)
              if (!isNaN(val) && val < 0) data.cell.styles.textColor = [220, 50, 50]
              else if (!isNaN(val) && val <= 5) data.cell.styles.textColor = [200, 150, 0]
            }
          },
        })

        yPos = doc.lastAutoTable.finalY + 10
      }

      // ---- Footer ----
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Ben Akiba · Belgrade · Good Vibes Only`, 14, 290)
        doc.text(`${i} / ${pageCount}`, 196, 290, { align: 'right' })
      }

      // Save
      const filename = `${event.title.replace(/\s+/g, '_')}_${dateStr.replace(/\./g, '')}.pdf`
      doc.save(filename)
    } catch (err) {
      console.error(err)
      alert('Greška pri generisanju PDF-a')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={styles.btnPrimary}
      onClick={generatePDF}
      disabled={loading}
      style={{ background: 'linear-gradient(135deg, #6a0dad, #9b30ff)' }}
    >
      {loading ? '⏳ Generišem...' : '📄 Download PDF'}
    </button>
  )
}
