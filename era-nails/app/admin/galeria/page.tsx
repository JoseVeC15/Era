'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface GalleryItem {
  id: string
  image_url: string
  title: string | null
  category: string | null
  position: number
  is_active: boolean
  created_at: string
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,200,220,0.2)',
  color: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const CATEGORIES = ['Pedicure', 'Acrílicas', 'Gel', 'Polygel', 'Diseño', 'Otros']

export default function GaleriaPage() {
  const router = useRouter()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ image_url: '', title: '', category: '', position: '0' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ image_url: '', title: '', category: '', position: '0' })
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/gallery')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); throw new Error('unauth') } return r.json() })
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(e => { if (e.message !== 'unauth') setLoading(false) })
  }, [router])

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!form.image_url.trim()) return
    setSaving(true); setError('')
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: form.image_url, title: form.title || null, category: form.category || null, position: Number(form.position) }),
    })
    setSaving(false)
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [item, ...prev])
      setForm({ image_url: '', title: '', category: '', position: '0' })
      setShowForm(false)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al agregar')
    }
  }

  async function toggleActive(item: GalleryItem) {
    setTogglingId(item.id)
    const res = await fetch('/api/admin/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    }
    setTogglingId(null)
  }

  function openEdit(item: GalleryItem) {
    setEditingId(item.id)
    setEditForm({ image_url: item.image_url, title: item.title ?? '', category: item.category ?? '', position: String(item.position) })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const res = await fetch('/api/admin/gallery', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, image_url: editForm.image_url, title: editForm.title || null, category: editForm.category || null, position: Number(editForm.position) }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === id ? updated : i))
      setEditingId(null)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return
    setDeletingId(id)
    await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
    setDeletingId(null)
  }

  const activeCount = items.filter(i => i.is_active).length

  return (
    <div className="admin-layout">
      <AdminNav />
      <div className="admin-content">
        <div className="schedule-header">
          <h1>Galería</h1>
          <div className="res-summary">
            <span className="res-stat"><strong>{activeCount}</strong> visibles</span>
            <span className="res-stat"><strong>{items.length - activeCount}</strong> ocultas</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? '✕ Cancelar' : '+ Agregar imagen'}
          </button>
        </div>

        {showForm && (
          <div className="horarios-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="horarios-section-title">Nueva imagen</h2>
            <form onSubmit={addItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>URL de la imagen *</p>
                <input style={inputStyle} type="url" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Título (opcional)</p>
                  <input style={inputStyle} type="text" placeholder="Ej: Uñas acrílicas nude" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Categoría</p>
                  <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Sin categoría</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Orden</p>
                  <input style={inputStyle} type="number" min="0" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
                </div>
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,200,220,0.2)' }} onError={e => (e.currentTarget.style.display = 'none')} />
              )}
              {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.75rem', opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </form>
          </div>
        )}

        {loading && <p className="loading-msg">Cargando galería...</p>}

        {!loading && items.length === 0 && (
          <div className="res-empty"><p>No hay imágenes en la galería. Agregá la primera.</p></div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} className={`res-card${!item.is_active ? ' res-card-cancelled' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
              {editingId === item.id ? (
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>URL</p>
                    <input style={inputStyle} type="url" value={editForm.image_url} onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Título</p>
                    <input style={inputStyle} type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Categoría</p>
                    <select style={inputStyle} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Sin categoría</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Orden</p>
                    <input style={inputStyle} type="number" min="0" value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
                    <button onClick={() => saveEdit(item.id)} disabled={saving} className="res-btn res-btn-confirm" style={{ flex: 2, opacity: saving ? 0.6 : 1 }}>
                      {saving ? '...' : '✓ Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image_url}
                      alt={item.title ?? 'Galería'}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', opacity: item.is_active ? 1 : 0.4 }}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23333" width="200" height="200"/><text fill="%23666" font-size="14" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Sin imagen</text></svg>' }}
                    />
                    {!item.is_active && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', color: '#aaa' }}>Oculta</div>
                    )}
                    {item.category && (
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', color: 'rgba(245,210,230,0.9)' }}>{item.category}</div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {item.title && <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>{item.title}</p>}
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', opacity: 0.45 }}>Orden: {item.position}</p>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => toggleActive(item)}
                        disabled={togglingId === item.id}
                        style={{ flex: 1, padding: '0.4rem', background: item.is_active ? 'rgba(255,107,107,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${item.is_active ? 'rgba(255,107,107,0.3)' : 'rgba(74,222,128,0.3)'}`, borderRadius: '6px', color: 'inherit', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        {item.is_active ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        disabled={deletingId === item.id}
                        style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
