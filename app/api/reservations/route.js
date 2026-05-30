import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')

  let query = supabase.from('reservations').select('*').order('sort_order').order('created_at')
  if (eventId) query = query.eq('event_id', eventId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: 'Neovlašćen pristup' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase.from('reservations').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
