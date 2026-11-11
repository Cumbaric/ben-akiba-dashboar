// Sortira događaje tako da predstojeći (danas i kasnije) idu prvi, po datumu rastuće
// (pa po vremenu), a završeni (pre današnjeg dana) idu na kraj, najskoriji prvi.
export function todayBelgrade() {
  // en-CA daje format YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Belgrade' }).format(new Date())
}

export function sortUpcomingFirst(events) {
  const today = todayBelgrade()
  const day = e => String(e.date).slice(0, 10)
  const time = e => String(e.time || '')

  const upcoming = []
  const past = []
  for (const e of events || []) (day(e) >= today ? upcoming : past).push(e)

  upcoming.sort((a, b) => day(a).localeCompare(day(b)) || time(a).localeCompare(time(b)))
  past.sort((a, b) => day(b).localeCompare(day(a)) || time(b).localeCompare(time(a)))

  return [...upcoming, ...past]
}

// Događaj je završen ako je njegov datum pre današnjeg dana.
export function isPastEvent(event) {
  return String(event.date).slice(0, 10) < todayBelgrade()
}

// Za pregled jednog meseca: prošli meseci idu hronološki (od 1. dana),
// tekući i budući meseci imaju predstojeće događaje prvo, završene na kraju.
export function sortForMonth(events, monthKey) {
  if (monthKey < todayBelgrade().slice(0, 7)) {
    const day = e => String(e.date).slice(0, 10)
    const time = e => String(e.time || '')
    return [...(events || [])].sort((a, b) => day(a).localeCompare(day(b)) || time(a).localeCompare(time(b)))
  }
  return sortUpcomingFirst(events)
}
