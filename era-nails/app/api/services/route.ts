import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Público — devuelve servicios activos para el formulario de reserva y el agente
export async function GET() {
  const svc = createServiceClient()
  const { data, error } = await svc
    .from('services')
    .select('id, name, category, price_from, price_to, duration_minutes')
    .eq('is_active', true)
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
