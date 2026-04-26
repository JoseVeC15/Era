import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()

  // Conversations with last message info
  const { data: convs, error } = await svc.rpc('crm_conversations')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get customer names from appointments for known phones
  const phones = (convs ?? []).map((c: any) => c.phone)
  const { data: appts } = phones.length
    ? await svc.from('appointments').select('customer_phone, customer_name').in('customer_phone', phones)
    : { data: [] }

  const nameMap: Record<string, string> = {}
  for (const a of appts ?? []) {
    if (!nameMap[a.customer_phone]) nameMap[a.customer_phone] = a.customer_name
  }

  const { data: pausedData } = await svc.from('bot_paused_phones').select('phone')
  const pausedSet = new Set((pausedData ?? []).map((p: any) => p.phone))

  const result = (convs ?? []).map((c: any) => ({
    phone: c.phone,
    name: nameMap[c.phone] ?? null,
    last_body: c.last_body,
    last_dir: c.last_dir,
    last_time: c.last_time,
    unread_count: Number(c.unread_count),
    bot_paused: pausedSet.has(c.phone),
  }))

  return NextResponse.json(result)
}
