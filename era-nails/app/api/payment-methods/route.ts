import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const svc = createServiceClient()
  const { data, error } = await svc.from('payment_methods').select('*').order('type')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, is_active, bank_name, account_number, account_holder, mobile_number, alias } = body
  if (!type) return NextResponse.json({ error: 'type requerido' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('payment_methods')
    .upsert(
      { type, is_active, bank_name: bank_name || null, account_number: account_number || null, account_holder: account_holder || null, mobile_number: mobile_number || null, alias: alias || null, updated_at: new Date().toISOString() },
      { onConflict: 'type' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
