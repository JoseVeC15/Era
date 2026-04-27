'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface Service {
  id: string
  name: string
  category: string
  price_from: number | null
  price_to: number | null
  duration_minutes: number | null
  is_active: boolean
  sort_order: number
}

function fmtPrice(from: number | null, to: number | null): string {
  if (!from) return '—'
  const f = `₲${(from / 1000).toFixed(0)}.000`
  if (to && to !== from) return `${f} – ₲${(to / 1000).toFixed(0)}.000`
  return f
}

const CATEGORIES = ['Plástica de Pies', 'Uñas Acrílicas', 'Gel & Polygel', 'Adicionales']

const inputStyle: React.CSSProperties = {
  padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,200,220,0.2)', borderRadius: '5px',
  color: 'inherit', fontSize: '0.85rem',
}

export default function ServiciosPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ price_from: string; price_to: string; duration_minutes: string }>({ price_from: '', price_to: '', duration_minutes: '' })
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newSvc, setNewSvc] = useState({ name: '', category: CATEGORIES[0], price_from: '', price_to: '', duration_minutes: '' })
  const [adding, setAdding] = useState(false)

  const fetchServices = useCallback(async () => {
    const res = await fetch('/api/admin/services')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setServices(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchServices() }, [fetchServices])

  async function toggleActive(s: Service) {
    const res = await fetch('/api/admin/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
    })
    if (res.ok) setServices(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x))
  }

  function startEdit(s: Service) {
    setEditingId(s.id)
    setEditForm({ price_from: s.price_from?.toString() ?? '', price_to: s.price_to?.toString() ?? '', duration_minutes: s.duration_minutes?.toString() ?? '' })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const res = await fetch('/api/admin/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        price_from: editForm.price_from ? parseInt(editForm.price_from) : null,
        price_to: editForm.price_to ? parseInt(editForm.price_to) : null,
        duration_minutes: editForm.duration_minutes ? parseInt(editForm.duration_minutes) : null,
      }),
    })
    setSaving(false)
    if (res.ok) { const updated = await res.json(); setServices(prev => prev.map(x => x.id === id ? updated : x)); setEditingId(null) }
  }

  async function addService() {
    if (!newSvc.name.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSvc.name.trim(),
        category: newSvc.category,
        price_from: newSvc.price_from ? parseInt(newSvc.price_from) : null,
        price_to: newSvc.price_to ? parseInt(newSvc.price_to) : null,
        duration_minutes: newSvc.duration_minutes ? parseInt(newSvc.duration_minutes) : null,
        sort_order: services.length * 10,
      }),
    })
    setAdding(false)
    if (res.ok) { const created = await res.json(); setServices(prev => [...prev, created]); setNewSvc({ name: '', category: CATEGORIES[0], price_from: '', price_to: '', duration_minutes: '' }); setShowAdd(false) }
  }

  // Group by category preserving insert order, then alphabetical within each group
  const categoryOrder = [...new Set([...CATEGORIES, ...services.map(s => s.category)])]
  const grouped: Record<string, Service[]> = {}
  services.forEach(s => { if (!grouped[s.category]) grouped[s.category] = []; grouped[s.category].push(s) })

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <div className="schedule-header">
          <h1>Catálogo de Servicios</h1>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-add-slot">{showAdd ? '✕ Cancelar' : '+ Agregar'}</button>
        </div>

        {showAdd && (
          <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', opacity: 0.7 }}>Nuevo servicio</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {[
                { field: 'name',             label: 'Nombre *',          type: 'text'   },
                { field: 'price_from',        label: 'Precio desde (₲)',  type: 'number' },
                { field: 'price_to',          label: 'Precio hasta (₲)',  type: 'number' },
                { field: 'duration_minutes',  label: 'Duración (min)',    type: 'number' },
              ].map(f => (
                <div key={f.field}>
                  <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: '0 0 0.25rem' }}>{f.label}</p>
                  <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type={f.type}
                    value={(newSvc as any)[f.field]}
                    onChange={e => setNewSvc(n => ({ ...n, [f.field]: e.target.value }))} />
                </div>
              ))}
              <div>
                <p style={{ fontSize: '0.7rem', opacity: 0.5, margin: '0 0 0.25rem' }}>Categoría *</p>
                <select style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={newSvc.category} onChange={e => setNewSvc(n => ({ ...n, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addService} disabled={adding || !newSvc.name.trim()} className="res-btn res-btn-confirm">
              {adding ? 'Guardando...' : '✓ Agregar servicio'}
            </button>
          </div>
        )}

        {loading && <p className="loading-msg">Cargando servicios...</p>}

        {categoryOrder.filter(c => grouped[c]?.length).map(cat => (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>{cat}</h3>
            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
              {grouped[cat].map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderBottom: i < grouped[cat].length - 1 ? '1px solid var(--glass-border)' : 'none', opacity: s.is_active ? 1 : 0.4 }}>
                  <button onClick={() => toggleActive(s)} style={{ background: s.is_active ? 'rgba(107,207,142,0.18)' : 'rgba(150,150,150,0.1)', border: `1px solid ${s.is_active ? 'rgba(107,207,142,0.4)' : 'rgba(150,150,150,0.2)'}`, borderRadius: '20px', padding: '0.15rem 0.55rem', fontSize: '0.68rem', cursor: 'pointer', color: s.is_active ? '#6bcf8e' : 'rgba(150,150,150,0.7)', whiteSpace: 'nowrap' }}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </button>

                  <span style={{ flex: 1, fontSize: '0.88rem' }}>{s.name}</span>

                  {editingId === s.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: '0.65rem', opacity: 0.45, margin: '0 0 0.15rem' }}>Precio (₲)</p>
                        <input style={{ ...inputStyle, width: '100px' }} type="number" placeholder="Desde" value={editForm.price_from} onChange={e => setEditForm(f => ({ ...f, price_from: e.target.value }))} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.65rem', opacity: 0.45, margin: '0 0 0.15rem' }}>Hasta</p>
                        <input style={{ ...inputStyle, width: '100px' }} type="number" placeholder="Hasta" value={editForm.price_to} onChange={e => setEditForm(f => ({ ...f, price_to: e.target.value }))} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.65rem', opacity: 0.45, margin: '0 0 0.15rem' }}>Min</p>
                        <input style={{ ...inputStyle, width: '70px' }} type="number" placeholder="Min" value={editForm.duration_minutes} onChange={e => setEditForm(f => ({ ...f, duration_minutes: e.target.value }))} />
                      </div>
                      <button onClick={() => saveEdit(s.id)} disabled={saving} className="res-btn res-btn-confirm" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', alignSelf: 'flex-end' }}>✓</button>
                      <button onClick={() => setEditingId(null)} className="res-btn res-btn-cancel" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', alignSelf: 'flex-end' }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.82rem', opacity: 0.6, whiteSpace: 'nowrap' }}>{fmtPrice(s.price_from, s.price_to)}</span>
                      <span style={{ fontSize: '0.78rem', opacity: 0.4, whiteSpace: 'nowrap', minWidth: '50px', textAlign: 'right' }}>{s.duration_minutes ? `${s.duration_minutes} min` : '—'}</span>
                      <button onClick={() => startEdit(s)} style={{ background: 'transparent', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '5px', padding: '0.2rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer', color: 'inherit', whiteSpace: 'nowrap' }}>Editar</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
