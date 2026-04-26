import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const svc = createServiceClient()
  const { data, error } = await svc
    .from('business_hours')
    .select('*')
    .order('day_of_week')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // body: array de { day_of_week, is_open, open_time, close_time }
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Array requerido' }, { status: 400 })

  const svc = createServiceClient()
  const { error } = await svc
    .from('business_hours')
    .upsert(body, { onConflict: 'day_of_week' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
