import { NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const todayPY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' })
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' })

  const { data: appts } = await svc
    .from('appointments')
    .select('id, service, status, available_slots(date)')
    .order('created_at', { ascending: false })
    .limit(1000)

  const all = (appts ?? []) as any[]
  const todayAppts = all.filter(a => a.available_slots?.date === todayPY)
  const weekAppts  = all.filter(a => {
    const d = a.available_slots?.date
    return d && d >= weekAgo && d <= todayPY
  })

  const serviceCount: Record<string, number> = {}
  all
    .filter(a => !['cancelled', 'no_show'].includes(a.status))
    .forEach(a => { serviceCount[a.service] = (serviceCount[a.service] ?? 0) + 1 })

  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return NextResponse.json({
    awaiting_review: all.filter(a => a.status === 'payment_received').length,
    today: {
      total: todayAppts.length,
      confirmed: todayAppts.filter(a => a.status === 'confirmed').length,
    },
    week: {
      total: weekAppts.length,
      completed: weekAppts.filter(a => a.status === 'completed').length,
      cancelled: weekAppts.filter(a => a.status === 'cancelled').length,
      no_show:   weekAppts.filter(a => a.status === 'no_show').length,
    },
    all_time: {
      total:     all.length,
      completed: all.filter(a => a.status === 'completed').length,
    },
    top_services: topServices,
  })
}
