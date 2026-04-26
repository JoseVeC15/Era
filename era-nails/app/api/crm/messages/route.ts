import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('crm_messages')
    .select('id, direction, body, msg_type, is_bot, read_by_owner, created_at')
    .eq('phone', phone)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const svc = createServiceClient()
  await svc
    .from('crm_messages')
    .update({ read_by_owner: true })
    .eq('phone', phone)
    .eq('direction', 'inbound')
    .eq('read_by_owner', false)

  return NextResponse.json({ ok: true })
}
