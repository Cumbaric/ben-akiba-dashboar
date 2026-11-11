export const MONTH_LABELS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

// 'YYYY-MM' ključ meseca za dati datum događaja
export function monthKey(date) {
  return String(date).slice(0, 7)
}

export function parseMonthKey(key) {
  const m = /^(\d{4})-(\d{2})$/.exec(key || '')
  if (!m) return null
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return { year: Number(m[1]), month }
}

export function monthLabel(key) {
  const p = parseMonthKey(key)
  return p ? MONTH_LABELS[p.month - 1] : key
}

const pad = n => String(n).padStart(2, '0')

// Pomeri ključ meseca za delta meseci ('2026-12' + 1 -> '2027-01')
export function shiftMonth(key, delta) {
  const { year, month } = parseMonthKey(key)
  const d = new Date(Date.UTC(year, month - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

// Prvi dan meseca i prvi dan sledećeg meseca (za gte/lt filtere)
export function monthRange(key) {
  const p = parseMonthKey(key)
  if (!p) return null
  return { start: `${key}-01`, end: `${shiftMonth(key, 1)}-01` }
}
