import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, body } = await req.json()
  if (!phone || !body?.trim()) return NextResponse.json({ error: 'phone y body requeridos' }, { status: 400 })

  const ycloudRes = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.YCLOUD_API_KEY!,
    },
    body: JSON.stringify({
      to: phone.startsWith('+') ? phone : `+${phone}`,
      type: 'text',
      text: { body: body.trim() },
      from: process.env.YCLOUD_WHATSAPP_NUMBER!,
    }),
  })

  if (!ycloudRes.ok) {
    const err = await ycloudRes.text()
    return NextResponse.json({ error: `YCloud error: ${err}` }, { status: 502 })
  }

  const svc = createServiceClient()
  const [{ data, error }] = await Promise.all([
    svc.from('crm_messages')
      .insert({ phone, direction: 'outbound', body: body.trim(), msg_type: 'text', is_bot: false })
      .select()
      .single(),
    svc.from('bot_paused_phones')
      .upsert({ phone, paused_at: new Date().toISOString() }),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
