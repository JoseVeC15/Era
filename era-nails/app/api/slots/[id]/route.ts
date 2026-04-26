import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// DELETE — eliminar slot (solo dueña)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const { error } = await svc.from('available_slots').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PUT — editar horario de un slot (solo dueña)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, start_time, end_time, service } = await req.json()
  if (!date || !start_time || !end_time)
    return NextResponse.json({ error: 'date, start_time y end_time son requeridos' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('available_slots')
    .update({ date, start_time, end_time, service: service ?? null })
    .eq('id', id)
    .eq('is_booked', false)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Turno no encontrado o ya reservado' }, { status: 404 })
  return NextResponse.json(data)
}

// PATCH — marcar como ocupado (chatbot/interno)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const svc = createServiceClient()
  const { data, error } = await svc
    .from('available_slots')
    .update({ is_booked: body.is_booked ?? true })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
