import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function authCheck() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET ?phone=xxx — check if paused
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  const { data } = await svc.from('bot_paused_phones').select('phone').eq('phone', phone).single()
  return NextResponse.json({ paused: !!data })
}

// POST { phone } — pause bot
export async function POST(req: NextRequest) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  await svc.from('bot_paused_phones').upsert({ phone, paused_at: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}

// DELETE ?phone=xxx — resume bot
export async function DELETE(req: NextRequest) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  await svc.from('bot_paused_phones').delete().eq('phone', phone)
  return NextResponse.json({ ok: true })
}
