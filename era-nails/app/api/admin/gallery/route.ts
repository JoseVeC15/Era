import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('gallery_items')
    .select('id, image_url, title, category, position, is_active, created_at')
    .order('position')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { image_url, title, category, position } = body
  if (!image_url?.trim()) return NextResponse.json({ error: 'image_url requerido' }, { status: 400 })

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('gallery_items')
    .insert({ image_url: image_url.trim(), title: title?.trim() || null, category: category?.trim() || null, position: position ?? 0 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, image_url, title, category, position, is_active } = body
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const update: Record<string, any> = {}
  if (image_url !== undefined) update.image_url = image_url.trim()
  if (title !== undefined) update.title = title?.trim() || null
  if (category !== undefined) update.category = category?.trim() || null
  if (position !== undefined) update.position = position
  if (is_active !== undefined) update.is_active = is_active

  const svc = createServiceClient()
  const { data, error } = await svc
    .from('gallery_items')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const svc = createServiceClient()
  const { error } = await svc.from('gallery_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
