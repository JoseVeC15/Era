import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

// GET — listar todas las reservas (solo admin)
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('appointments')
    .select(`
      id, customer_name, customer_phone, service, status, notes, created_at,
      available_slots ( id, date, start_time, end_time )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — reservar turno (público, sin auth)
// Bloquea el slot y crea la reserva en estado 'pending'.
// El admin confirma la seña y cambia el estado a 'confirmed'.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slot_id, customer_name, customer_phone, service, notes } = body

  if (!slot_id || !customer_name?.trim() || !customer_phone?.trim() || !service?.trim()) {
    return NextResponse.json(
      { error: 'slot_id, customer_name, customer_phone y service son requeridos' },
      { status: 400 }
    )
  }

  const svc = createServiceClient()

  // Intentar bloquear el slot de forma atómica: solo actualiza si sigue libre
  const { data: slotUpdate, error: slotErr } = await svc
    .from('available_slots')
    .update({ is_booked: true })
    .eq('id', slot_id)
    .eq('is_booked', false)
    .select('id')
    .single()

  if (slotErr || !slotUpdate) {
    return NextResponse.json(
      { error: 'Este turno ya no está disponible' },
      { status: 409 }
    )
  }

  // Crear la reserva en estado pending
  const { data: appt, error: apptErr } = await svc
    .from('appointments')
    .insert({
      slot_id,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      service: service.trim(),
      notes: notes?.trim() || null,
      status: 'pending',
    })
    .select(`
      id, customer_name, customer_phone, service, status, notes, created_at,
      available_slots ( id, date, start_time, end_time )
    `)
    .single()

  if (apptErr) {
    // Si falla la inserción, liberar el slot
    await svc.from('available_slots').update({ is_booked: false }).eq('id', slot_id)
    return NextResponse.json({ error: apptErr.message }, { status: 500 })
  }

  return NextResponse.json(appt, { status: 201 })
}
