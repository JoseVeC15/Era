import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 30

async function sendWhatsApp(to: string, message: string) {
  if (!process.env.YCLOUD_API_KEY || !process.env.YCLOUD_WHATSAPP_NUMBER) return
  const phone = to.startsWith('+') ? to : `+${to}`
  await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.YCLOUD_API_KEY },
    body: JSON.stringify({ to: phone, type: 'text', text: { body: message }, from: process.env.YCLOUD_WHATSAPP_NUMBER }),
  }).catch(() => {})
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()

  const { data: appointments, error } = await svc
    .from('appointments')
    .select('id, customer_name, customer_phone, service, reminder_24h_sent, reminder_2h_sent, available_slots(date, start_time)')
    .eq('status', 'confirmed')
    .limit(200)

  if (error || !appointments) {
    return NextResponse.json({ error: error?.message ?? 'no data' }, { status: 500 })
  }

  const nowMs = Date.now()
  const sent24h: string[] = []
  const sent2h: string[] = []

  for (const appt of appointments as any[]) {
    const slot = appt.available_slots
    if (!slot?.date || !slot?.start_time) continue

    // Paraguay is UTC-4 — interpret slot datetime as local PY time
    const apptMs = new Date(`${slot.date}T${slot.start_time}-04:00`).getTime()
    const diffHours = (apptMs - nowMs) / 3_600_000

    if (!appt.reminder_24h_sent && diffHours >= 22 && diffHours <= 26) {
      const dateLabel = new Date(slot.date + 'T12:00:00').toLocaleDateString('es-PY', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Asuncion',
      })
      const timeLabel = slot.start_time.slice(0, 5)
      const msg = `¡Hola ${appt.customer_name}! 💅\n\nTe recordamos tu turno en *Era Nails & Hair* mañana a las *${timeLabel}*.\n\n📅 ${dateLabel}\n💅 ${appt.service}\n\nSi necesitás cancelar o cambiar el horario, escribinos. ¡Te esperamos! 🌸`
      await sendWhatsApp(appt.customer_phone, msg)
      sent24h.push(appt.id)
    }

    if (!appt.reminder_2h_sent && diffHours >= 1 && diffHours <= 3) {
      const timeLabel = slot.start_time.slice(0, 5)
      const msg = `¡Hola ${appt.customer_name}! 💕\n\nTu turno en *Era Nails & Hair* es *hoy a las ${timeLabel}*.\n\n✨ ¡Te esperamos con muchas ganas!\n📍 Fernando de la Mora, a 1/2 cuadra del Real Sur.`
      await sendWhatsApp(appt.customer_phone, msg)
      sent2h.push(appt.id)
    }
  }

  if (sent24h.length > 0) {
    await svc.from('appointments').update({ reminder_24h_sent: true }).in('id', sent24h)
  }
  if (sent2h.length > 0) {
    await svc.from('appointments').update({ reminder_2h_sent: true }).in('id', sent2h)
  }

  console.log(`[cron/reminders] checked:${appointments.length} 24h:${sent24h.length} 2h:${sent2h.length}`)
  return NextResponse.json({ checked: appointments.length, sent_24h: sent24h.length, sent_2h: sent2h.length })
}
