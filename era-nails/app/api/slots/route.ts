import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// GET — slots disponibles futuros (público)
export async function GET() {
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('available_slots')
    .select('id, date, start_time, end_time')
    .eq('is_booked', false)
    .gte('date', today)
    .order('date')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — crear slot (solo dueña autenticada)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date, start_time, end_time, service } = body

  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: 'date, start_time y end_time son requeridos' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('available_slots')
    .insert({ date, start_time, end_time, service: service || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
