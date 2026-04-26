import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

// GET ?phone=xxx — check if paused (usado por el agente internamente)
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  const { data } = await svc.from('bot_paused_phones').select('phone').eq('phone', phone).single()
  return NextResponse.json({ paused: !!data })
}

// POST { phone } — pause bot
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  await svc.from('bot_paused_phones').upsert({ phone, paused_at: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}

// DELETE ?phone=xxx — resume bot
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })
  const svc = createServiceClient()
  await svc.from('bot_paused_phones').delete().eq('phone', phone)
  return NextResponse.json({ ok: true })
}
