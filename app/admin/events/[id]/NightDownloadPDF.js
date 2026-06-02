'use client'

import { useState } from 'react'
import styles from '../../admin.module.css'

const DAY_SHORT = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC']

const FLOOR_LABELS = {
  ground_floor: 'GROUND FLOOR (dole)',
  white_lounge: 'WHITE LOUNGE (gore)',
  after: 'AFTER',
  all: 'SVE SALE',
}
const FLOOR_ORDER = ['ground_floor', 'white_lounge', 'after', 'all']
const FONT_NAME = 'DejaVuSans'

async function loadFontBase64(url) {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

let _fontCache = null
async function getFonts() {
  if (_fontCache) return _fontCache
  const [regular, bold] = await Promise.all([
    loadFontBase64('/fonts/DejaVuSans.ttf'),
    loadFontBase64('/fonts/DejaVuSans-Bold.ttf'),
  ])
  _fontCache = { regular, bold }
  return _fontCache
}

export default function NightDownloadPDF({ events, reservations }) {
  const [loading, setLoading] = useState(false)

  async function generatePDF() {
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const fonts = await getFonts()
      doc.addFileToVFS('DejaVuSans.ttf', fonts.regular)
      doc.addFont('DejaVuSans.ttf', FONT_NAME, 'normal')
      doc.addFileToVFS('DejaVuSans-Bold.ttf', fonts.bold)
      doc.addFont('DejaVuSans-Bold.ttf', FONT_NAME, 'bold')
      doc.addFont('DejaVuSans.ttf', FONT_NAME, 'italic')
      doc.setFont(FONT_NAME, 'normal')

      const sorted = [...events].sort((a, b) => FLOOR_ORDER.indexOf(a.floor) - FLOOR_ORDER.indexOf(b.floor))
      const first = sorted[0] || {}
      const d = new Date(first.date)
      const dateStr = `${DAY_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${MONTH_NAMES[d.getMonth()]}.${d.getFullYear()}`

      // Header
      doc.setFontSize(20)
      doc.setFont(FONT_NAME, 'bold')
      doc.text('BEN AKIBA', 105, 18, { align: 'center' })
      doc.setFontSize(11)
      doc.setFont(FONT_NAME, 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Comedy Club & Bar', 105, 25, { align: 'center' })

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont(FONT_NAME, 'bold')
      doc.text(`Žurka · ${dateStr}`, 105, 35, { align: 'center' })

      doc.setDrawColor(200, 200, 200)
      doc.line(14, 40, 196, 40)

      let yPos = 48

      const grandTotal = reservations.reduce((s, r) => s + (r.num_people || 0), 0)
      doc.setFontSize(10)
      doc.setFont(FONT_NAME, 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text(`Ukupno gostiju (cela večer): ${grandTotal}`, 14, yPos)
      yPos += 8

      // Po jedan blok za svaki sprat
      for (const ev of sorted) {
        const rows = reservations.filter(r => r.event_id === ev.id)
        const totalPeople = rows.reduce((s, r) => s + (r.num_people || 0), 0)

        if (yPos > 245) { doc.addPage(); yPos = 20 }

        doc.setFontSize(11)
        doc.setFont(FONT_NAME, 'bold')
        doc.setTextColor(40, 40, 40)
        doc.text(`${FLOOR_LABELS[ev.floor] || ev.floor}   (${totalPeople} osoba)`, 14, yPos)
        yPos += 5

        doc.setFontSize(9)
        doc.setFont(FONT_NAME, 'normal')
        doc.setTextColor(110, 110, 110)
        const meta = [ev.performer, ev.time, ev.price ? `${Number(ev.price).toLocaleString('sr-RS')} RSD` : null]
          .filter(Boolean).join('  ·  ')
        doc.text(meta, 14, yPos)
        yPos += 4

        if (rows.length === 0) {
          doc.setFont(FONT_NAME, 'italic')
          doc.setTextColor(150, 150, 150)
          doc.text('Nema rezervacija', 14, yPos + 4)
          yPos += 14
          continue
        }

        let running = ev.capacity || 0
        const body = rows.map((r, i) => {
          running -= (r.num_people || 0)
          return [String(i + 1), r.name || '', r.phone || '', String(r.num_people || 1), String(running)]
        })

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Ime', 'Telefon', 'Br. osoba', 'Rezervacije']],
          body,
          theme: 'striped',
          styles: { font: FONT_NAME },
          headStyles: { fillColor: [60, 20, 80], textColor: 255, fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 78 },
            2: { cellWidth: 46 },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 28, halign: 'center' },
          },
          margin: { left: 14, right: 14 },
          tableWidth: 182,
        })
        yPos = doc.lastAutoTable.finalY + 10
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('Ben Akiba · Belgrade · Good Vibes Only', 14, 290)
        doc.text(`${i} / ${pageCount}`, 196, 290, { align: 'right' })
      }

      doc.save(`Zurka_${dateStr.replace(/\./g, '')}.pdf`)
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
      {loading ? '⏳ Generišem...' : '📄 PDF (cela večer)'}
    </button>
  )
}
