'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface CustomerStats {
  total: number
  completed: number
  cancelled: number
  lastService: string | null
  lastDate: string | null
}

interface Customer {
  id: string | null
  phone: string
  name: string | null
  notes: string | null
  tags: string[]
  created_at: string | null
  stats: CustomerStats
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,200,220,0.2)',
  color: 'inherit', outline: 'none', boxSizing: 'border-box',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 30) return `hace ${d} días`
  const m = Math.floor(d / 30)
  return `hace ${m} mes${m > 1 ? 'es' : ''}`
}

export default function ClientesPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPhone, setEditingPhone] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', notes: '', tags: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/customers')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setCustomers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  function openEdit(c: Customer) {
    setEditingPhone(c.phone)
    setEditForm({ name: c.name ?? '', notes: c.notes ?? '', tags: (c.tags ?? []).join(', ') })
  }

  async function saveEdit(phone: string) {
    setSaving(true)
    const tags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    const res = await fetch('/api/admin/customers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name: editForm.name || null, notes: editForm.notes || null, tags }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setCustomers(prev => prev.map(c => c.phone === phone ? { ...c, ...updated } : c))
      setEditingPhone(null)
    }
  }

  const filtered = customers.filter(c =>
    !search || c.phone.includes(search) || (c.name?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalCompleted = customers.reduce((s, c) => s + c.stats.completed, 0)

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <div className="schedule-header">
          <h1>Clientes</h1>
          <div className="res-summary">
            <span className="res-stat"><strong>{customers.length}</strong> clientes</span>
            <span className="res-stat"><strong>{totalCompleted}</strong> turnos completados</span>
          </div>
        </div>

        <div style={{ maxWidth: '420px', marginBottom: '1.5rem' }}>
          <input
            style={{ ...inputStyle, padding: '0.7rem 1rem' }}
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="loading-msg">Cargando clientes...</p>}
        {!loading && filtered.length === 0 && (
          <div className="res-empty"><p>No hay clientes registrados aún.</p></div>
        )}

        <div className="res-list">
          {filtered.map(c => {
            const isEditing = editingPhone === c.phone
            return (
              <div key={c.phone} className="res-card">
                <div className="res-card-top">
                  <div className="res-client">
                    <span className="res-name">{c.name ?? c.phone}</span>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="res-phone">
                      📱 {c.phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(c.tags ?? []).map(tag => (
                      <span key={tag} style={{ padding: '2px 8px', background: 'rgba(245,210,230,0.12)', borderRadius: '12px', fontSize: '0.75rem', color: 'rgba(245,210,230,0.7)' }}>{tag}</span>
                    ))}
                    <button
                      onClick={() => isEditing ? setEditingPhone(null) : openEdit(c)}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer' }}
                    >
                      {isEditing ? '✕ Cerrar' : '✏️ Editar'}
                    </button>
                  </div>
                </div>

                <div className="res-card-body">
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: c.notes ? '0.5rem' : 0 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--quartz)', opacity: 0.7 }}>
                      <strong>{c.stats.total}</strong> reservas · <strong>{c.stats.completed}</strong> completadas
                      {c.stats.cancelled > 0 && ` · ${c.stats.cancelled} canceladas`}
                    </span>
                    {c.stats.lastService && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--quartz)', opacity: 0.6 }}>
                        Último: {c.stats.lastService}{c.stats.lastDate ? ` (${timeAgo(c.stats.lastDate)})` : ''}
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <div className="res-info-row" style={{ marginTop: '0.4rem' }}>
                      <span className="res-label">Notas</span>
                      <span className="res-value res-notes">{c.notes}</span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div style={{ borderTop: '1px solid rgba(255,200,220,0.15)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Nombre</p>
                        <input style={inputStyle} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del cliente" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Etiquetas (separadas por coma)</p>
                        <input style={inputStyle} value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} placeholder="Ej: VIP, frecuente" />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Notas internas</p>
                      <textarea
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Preferencias, alergias, observaciones..."
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingPhone(null)} style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Cancelar
                      </button>
                      <button onClick={() => saveEdit(c.phone)} disabled={saving} className="res-btn res-btn-confirm" style={{ flex: 2, opacity: saving ? 0.6 : 1 }}>
                        {saving ? 'Guardando...' : '✓ Guardar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
