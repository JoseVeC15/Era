import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()

  // Get all customer profiles enriched with appointment stats
  const { data: profiles, error } = await svc
    .from('customer_profiles')
    .select('id, phone, name, notes, tags, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get appointment counts per phone
  const { data: appts } = await svc
    .from('appointments')
    .select('customer_phone, status, service, created_at')

  const statsMap: Record<string, { total: number; completed: number; cancelled: number; lastService: string | null; lastDate: string | null }> = {}
  for (const a of appts ?? []) {
    if (!statsMap[a.customer_phone]) statsMap[a.customer_phone] = { total: 0, completed: 0, cancelled: 0, lastService: null, lastDate: null }
    statsMap[a.customer_phone].total++
    if (a.status === 'completed') statsMap[a.customer_phone].completed++
    if (a.status === 'cancelled') statsMap[a.customer_phone].cancelled++
    if (!statsMap[a.customer_phone].lastDate || a.created_at > statsMap[a.customer_phone].lastDate!) {
      statsMap[a.customer_phone].lastDate = a.created_at
      statsMap[a.customer_phone].lastService = a.service
    }
  }

  // Also include phones with appointments but no profile yet
  const profilePhones = new Set((profiles ?? []).map((p: any) => p.phone))
  const extraPhones = [...new Set(Object.keys(statsMap))].filter(ph => !profilePhones.has(ph))
  const extraProfiles = extraPhones.map(ph => ({
    id: null, phone: ph, name: null, notes: null, tags: [], created_at: null, updated_at: null,
  }))

  const result = [...(profiles ?? []), ...extraProfiles].map((p: any) => ({
    ...p,
    stats: statsMap[p.phone] ?? { total: 0, completed: 0, cancelled: 0, lastService: null, lastDate: null },
  }))

  return NextResponse.json(result)
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { phone, name, notes, tags } = body
  if (!phone) return NextResponse.json({ error: 'phone requerido' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('customer_profiles')
    .upsert(
      { phone, name: name?.trim() || null, notes: notes?.trim() || null, tags: tags ?? [], updated_at: new Date().toISOString() },
      { onConflict: 'phone' }
    )
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
