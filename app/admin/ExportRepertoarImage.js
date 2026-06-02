'use client'

import { useState } from 'react'
import styles from './admin.module.css'

const DAY_NAMES = ['NED', 'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB']
const MONTH = ['01','02','03','04','05','06','07','08','09','10','11','12']

const COLS = [
  { key: 'datum', label: 'DATUM', w: 100, align: 'left' },
  { key: 'vreme', label: 'VREME', w: 62, align: 'left' },
  { key: 'predstava', label: 'PREDSTAVA', w: 215, align: 'left', wrap: true },
  { key: 'izvodjac', label: 'IZVOĐAČ', w: 250, align: 'left', wrap: true },
  { key: 'cena', label: 'CENA', w: 100, align: 'left' },
  { key: 'tc', label: 'TC', w: 46, align: 'center', color: '#e91e8c' },
  { key: 'tl', label: 'TL', w: 46, align: 'center', color: '#40c4ff' },
  { key: 'fr', label: 'FR', w: 46, align: 'center', color: '#00e676' },
  { key: 'uk', label: 'UK', w: 46, align: 'center', color: '#b388ff' },
  { key: 'pv', label: 'PV', w: 46, align: 'center', color: '#ffd54f' },
]

const PADX = 28
const FONT = "'Segoe UI', Arial, sans-serif"

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w
    if (ctx.measureText(test).width <= maxWidth || !cur) cur = test
    else { lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  if (lines.length <= maxLines) return lines
  const capped = lines.slice(0, maxLines)
  let last = capped[maxLines - 1]
  while (last.length && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1)
  capped[maxLines - 1] = last + '…'
  return capped
}

export default function ExportRepertoarImage({ rows }) {
  const [loading, setLoading] = useState(false)

  async function exportImage() {
    setLoading(true)
    try {
      const scale = 2
      const contentW = COLS.reduce((s, c) => s + c.w, 0)
      const W = contentW + PADX * 2
      const headerTop = 28
      const logoH = 60
      const tableTop = headerTop + logoH + 56
      const colHeadH = 40
      const rowH = 58
      const cellPad = 10
      const footerH = 54
      const H = tableTop + colHeadH + rows.length * rowH + footerH

      const canvas = document.createElement('canvas')
      canvas.width = W * scale
      canvas.height = H * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.textBaseline = 'middle'

      // pozadina
      ctx.fillStyle = '#0d0d1a'
      ctx.fillRect(0, 0, W, H)

      // logo (transparentni PNG)
      try {
        const img = new Image()
        img.src = '/logo-transparent.png'
        await new Promise(res => { img.onload = res; img.onerror = res })
        if (img.width) {
          const lh = logoH
          const lw = (img.width / img.height) * lh
          ctx.drawImage(img, (W - lw) / 2, headerTop, lw, lh)
        }
      } catch {}

      // podnaslov
      ctx.fillStyle = '#e91e8c'
      ctx.font = `700 13px ${FONT}`
      ctx.textAlign = 'center'
      ctx.fillText('STAND UP · REPERTOAR', W / 2, headerTop + logoH + 22)

      // x pozicije kolona
      const colX = []
      let x = PADX
      for (const c of COLS) { colX.push(x); x += c.w }

      // zaglavlje kolona
      const chY = tableTop
      ctx.fillStyle = '#13131f'
      ctx.fillRect(PADX, chY, contentW, colHeadH)
      ctx.font = `700 11px ${FONT}`
      COLS.forEach((c, i) => {
        ctx.fillStyle = c.color || '#8888aa'
        if (c.align === 'center') {
          ctx.textAlign = 'center'
          ctx.fillText(c.label, colX[i] + c.w / 2, chY + colHeadH / 2)
        } else {
          ctx.textAlign = 'left'
          ctx.fillText(c.label, colX[i] + cellPad, chY + colHeadH / 2)
        }
      })

      // redovi
      let ry = chY + colHeadH
      ctx.font = `400 14px ${FONT}`
      rows.forEach((r, idx) => {
        if (idx % 2 === 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.025)'
          ctx.fillRect(PADX, ry, contentW, rowH)
        }
        // separator
        ctx.strokeStyle = '#1a1a2e'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(PADX, ry + rowH); ctx.lineTo(PADX + contentW, ry + rowH); ctx.stroke()

        const d = new Date(r.date)
        const dateStr = `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2,'0')}.${MONTH[d.getMonth()]}.`
        const cy = ry + rowH / 2

        COLS.forEach((c, i) => {
          const cx = colX[i]
          if (c.key === 'datum') {
            ctx.textAlign = 'left'; ctx.font = `700 13px ${FONT}`; ctx.fillStyle = '#e91e8c'
            ctx.fillText(dateStr, cx + cellPad, cy)
          } else if (c.key === 'vreme') {
            ctx.textAlign = 'left'; ctx.font = `400 13px ${FONT}`; ctx.fillStyle = '#9999bb'
            ctx.fillText(r.time || '', cx + cellPad, cy)
          } else if (c.key === 'predstava' || c.key === 'izvodjac') {
            const val = c.key === 'predstava' ? r.title : r.performer
            ctx.font = c.key === 'predstava' ? `700 14px ${FONT}` : `400 13px ${FONT}`
            ctx.fillStyle = c.key === 'predstava' ? '#ffffff' : '#9999bb'
            ctx.textAlign = 'left'
            const lines = wrapText(ctx, val, c.w - cellPad * 2, 2)
            const lh = 17
            const startY = cy - ((lines.length - 1) * lh) / 2
            lines.forEach((ln, li) => ctx.fillText(ln, cx + cellPad, startY + li * lh))
          } else if (c.key === 'cena') {
            ctx.textAlign = 'left'; ctx.font = `700 13px ${FONT}`; ctx.fillStyle = '#b388ff'
            ctx.fillText(`${Number(r.price || 0).toLocaleString('sr-RS')} RSD`, cx + cellPad, cy)
          } else {
            // stat kolone
            ctx.textAlign = 'center'; ctx.font = `700 14px ${FONT}`; ctx.fillStyle = c.color
            ctx.fillText(String(r[c.key] ?? 0), cx + c.w / 2, cy)
          }
        })
        ry += rowH
      })

      // footer
      ctx.textAlign = 'center'
      ctx.font = `600 10px ${FONT}`
      ctx.fillStyle = '#444466'
      const now = new Date()
      const gen = `${String(now.getDate()).padStart(2,'0')}.${MONTH[now.getMonth()]}.${now.getFullYear()}`
      ctx.fillText(`BEN AKIBA · BELGRADE · GOOD VIBES ONLY · ${gen}`, W / 2, ry + 28)

      // download
      await new Promise(res => canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `standup-repertoar-${gen.replace(/\./g,'')}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        res()
      }, 'image/png'))
    } catch (err) {
      console.error(err)
      alert('Greška pri kreiranju slike')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={styles.btnPrimary}
      onClick={exportImage}
      disabled={loading || !rows.length}
      style={{ background: 'linear-gradient(135deg, #00b894, #00e676)' }}
    >
      {loading ? '⏳ Generišem...' : '📸 Preuzmi sliku'}
    </button>
  )
}
