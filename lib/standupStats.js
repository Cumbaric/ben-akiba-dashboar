import { supabase } from '@/lib/supabase'

// Dodaje izračunate vrednosti rezervacija (iz reservations tabele) stand-up događajima.
// Vraća { rows, exportRows } za admin tabelu i PNG izvoz repertoara.
export async function withStandupStats(events) {
  const baseRows = events ?? []
  const ids = baseRows.map(e => e.id)
  const { data: reservations } = await supabase
    .from('reservations')
    .select('event_id, section, num_people, confirmed')
    .in('event_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

  const stats = {}
  ;(reservations || []).forEach(r => {
    if (!stats[r.event_id]) stats[r.event_id] = { tickets: 0, phone: 0, free: 0, waitlist: 0, confirmed: 0 }
    const n = r.num_people || 0
    if (r.section === 'tickets') stats[r.event_id].tickets += n
    else if (r.section === 'phone') stats[r.event_id].phone += n
    else if (r.section === 'free') stats[r.event_id].free += n
    else if (r.section === 'waitlist') stats[r.event_id].waitlist += n
    if (r.confirmed && r.section !== 'waitlist') stats[r.event_id].confirmed += n
  })

  const empty = { tickets: 0, phone: 0, free: 0, waitlist: 0, confirmed: 0 }

  const rows = baseRows.map(e => {
    const s = stats[e.id] || empty
    return { ...e, sold: s.tickets, reserved: s.phone + s.free, confirmed: s.confirmed, waitlist: s.waitlist }
  })

  const exportRows = baseRows.map(e => {
    const s = stats[e.id] || empty
    return {
      date: e.date, time: e.time, title: e.title, performer: e.performer, price: e.price,
      tc: s.tickets, tl: s.phone, fr: s.free, uk: s.tickets + s.phone + s.free, pv: s.confirmed,
    }
  })

  return { rows, exportRows }
}
