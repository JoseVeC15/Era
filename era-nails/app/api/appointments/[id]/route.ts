import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()
  const validStatuses = ['confirmed', 'cancelled', 'completed', 'pending']
  if (!validStatuses.includes(status))
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })

  const svc = createServiceClient()

  const { data: appt, error: fetchErr } = await svc
    .from('appointments')
    .select('id, slot_id, status, customer_phone, customer_name, service, available_slots(date, start_time, end_time)')
    .eq('id', id)
    .single()

  if (fetchErr || !appt) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  const { data, error } = await svc
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'cancelled' && appt.slot_id) {
    await svc.from('available_slots').update({ is_booked: false }).eq('id', appt.slot_id)
  }

  if (status === 'confirmed' && appt.customer_phone && process.env.YCLOUD_API_KEY && process.env.YCLOUD_WHATSAPP_NUMBER) {
    const slot = (appt as any).available_slots
    const slotText = slot
      ? `📅 ${new Date(slot.date + 'T12:00:00').toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${slot.start_time.slice(0, 5)}`
      : ''
    const msg = `✅ ¡Hola ${appt.customer_name}! Tu turno en Era Nails & Hair fue *confirmado*.\n\n💅 Servicio: ${appt.service}${slotText ? `\n${slotText}` : ''}\n\n¡Te esperamos! 💕`
    const phone = appt.customer_phone.startsWith('+') ? appt.customer_phone : `+${appt.customer_phone}`
    fetch('https://api.ycloud.com/v2/whatsapp/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.YCLOUD_API_KEY },
      body: JSON.stringify({ to: phone, type: 'text', text: { body: msg }, from: process.env.YCLOUD_WHATSAPP_NUMBER }),
    }).catch(() => {})
  }

  return NextResponse.json(data)
}
