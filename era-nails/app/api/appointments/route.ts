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

  // Reservar usando RPC atómica con FOR UPDATE — evita doble-booking incluso bajo concurrencia
  const { data: result, error: rpcErr } = await svc.rpc('reserve_slot', {
    p_slot_id: slot_id,
    p_customer_name: customer_name.trim(),
    p_customer_phone: customer_phone.trim(),
    p_service: service.trim(),
    p_notes: notes?.trim() || null,
  })

  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  if (!result.success) {
    const status = result.error === 'slot_already_booked' ? 409 : 400
    const message = result.error === 'slot_already_booked'
      ? 'Este turno ya no está disponible'
      : result.error
    return NextResponse.json({ error: message }, { status })
  }

  const { data: appt, error: fetchErr } = await svc
    .from('appointments')
    .select(`
      id, customer_name, customer_phone, service, status, notes, created_at,
      available_slots ( id, date, start_time, end_time )
    `)
    .eq('id', result.appointment_id)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  return NextResponse.json(appt, { status: 201 })
}
