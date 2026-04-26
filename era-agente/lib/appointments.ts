import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }
  return _client
}

export interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export interface Appointment {
  id: string
  slot_id: string
  customer_name: string
  customer_phone: string
  service: string
  status: string
  notes?: string
  created_at: string
}

export async function getAvailableSlots(date?: string, from?: string, to?: string): Promise<Slot[]> {
  const today = new Date().toISOString().split('T')[0]
  let query = db()
    .from('available_slots')
    .select('id, date, start_time, end_time, is_booked')
    .eq('is_booked', false)
    .gte('date', today)
    .order('date')
    .order('start_time')

  if (date) {
    query = query.eq('date', date)
  } else if (from || to) {
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function isSlotAvailable(slotId: string): Promise<boolean> {
  const { data } = await db()
    .from('available_slots')
    .select('is_booked')
    .eq('id', slotId)
    .single()
  return data ? !data.is_booked : false
}

export async function createAppointment(data: {
  slot_id: string
  name: string
  phone: string
  service: string
  notes?: string
}): Promise<Appointment> {
  const { error: slotErr } = await db()
    .from('available_slots')
    .update({ is_booked: true })
    .eq('id', data.slot_id)

  if (slotErr) throw new Error(`Error reservando slot: ${slotErr.message}`)

  const { data: appt, error } = await db()
    .from('appointments')
    .insert({
      slot_id: data.slot_id,
      customer_name: data.name,
      customer_phone: data.phone,
      service: data.service,
      notes: data.notes,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return appt
}

export async function getSlotById(id: string): Promise<Slot | null> {
  const { data } = await db()
    .from('available_slots')
    .select('id, date, start_time, end_time, is_booked')
    .eq('id', id)
    .single()
  return data ?? null
}

export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
  const { data, error } = await db()
    .from('appointments')
    .select('*, available_slots(date, start_time, end_time)')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ── Admin functions ────────────────────────────────────────────────────────

export async function adminCreateSlot(date: string, start_time: string, end_time: string): Promise<Slot> {
  const { data, error } = await db()
    .from('available_slots')
    .insert({ date, start_time, end_time, is_booked: false })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function adminDeleteSlot(id: string): Promise<void> {
  const { error } = await db()
    .from('available_slots')
    .delete()
    .eq('id', id)
    .eq('is_booked', false)
  if (error) throw new Error(error.message)
}

export async function adminListSlots(date?: string, from?: string, to?: string): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]
  let query = db()
    .from('available_slots')
    .select('id, date, start_time, end_time, is_booked, appointments(customer_name, customer_phone, service, status)')
    .order('date')
    .order('start_time')

  if (date) {
    query = query.eq('date', date)
  } else {
    const rangeFrom = from ?? today
    const rangeTo = to ?? new Date(new Date(rangeFrom).getTime() + 14 * 86400000).toISOString().split('T')[0]
    query = query.gte('date', rangeFrom).lte('date', rangeTo)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function adminListAppointments(status?: string): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]
  let query = db()
    .from('appointments')
    .select('id, customer_name, customer_phone, service, status, notes, created_at, available_slots(date, start_time, end_time)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).filter((a: any) => {
    const slot = a.available_slots
    return !slot || slot.date >= today
  })
}

export async function adminCancelAppointment(id: string): Promise<void> {
  const { data: appt, error: fetchErr } = await db()
    .from('appointments')
    .select('slot_id')
    .eq('id', id)
    .single()
  if (fetchErr || !appt) throw new Error('Reserva no encontrada')

  const { error } = await db()
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw new Error(error.message)

  if (appt.slot_id) {
    await db().from('available_slots').update({ is_booked: false }).eq('id', appt.slot_id)
  }
}
