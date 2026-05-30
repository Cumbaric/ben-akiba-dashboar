import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(request, { params }) {
  const isAdmin = await getSession()
  if (!isAdmin) return NextResponse.json({ error: 'Neovlašćen pristup' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('events')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
  const isAdmin = await getSession()
  console.log('[DELETE] isAdmin:', isAdmin, '| id:', params.id)
  if (!isAdmin) return NextResponse.json({ error: 'Neovlašćen pristup' }, { status: 401 })

  const { data, error } = await supabase.from('events').delete().eq('id', params.id).select()
  console.log('[DELETE] data:', data, '| error:', error)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
