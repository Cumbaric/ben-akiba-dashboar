import { NextResponse } from 'next/server'
import { isValidCredentials } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request) {
  const { username, password } = await request.json()

  if (!isValidCredentials(username, password)) {
    return NextResponse.json({ error: 'Pogrešni podaci' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ ok: true })
}
