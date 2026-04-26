import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

// GET /api/slots/week?from=YYYY-MM-DD&to=YYYY-MM-DD — para el panel admin
export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) return NextResponse.json({ error: 'from y to son requeridos' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('available_slots')
    .select('id, date, start_time, end_time, is_booked, service')
    .gte('date', from)
    .lte('date', to)
    .order('date')
    .order('start_time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
