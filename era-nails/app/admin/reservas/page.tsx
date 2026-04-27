'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

interface Slot    { id: string; date: string; start_time: string; end_time: string }
interface Service { id: string; name: string; category: string }

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  service: string
  status: 'pending' | 'payment_received' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  created_at: string
  available_slots: Slot | null
}

interface EditForm {
  customer_name: string
  customer_phone: string
  service: string
  notes: string
  slot_id: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  payment_received: 'Seña recibida',
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  payment_received: 'badge-payment',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  no_show: 'badge-noshow',
}


function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-PY', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}
function formatTime(t: string) { return t.slice(0, 5) }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,200,220,0.2)',
  color: 'inherit', outline: 'none', boxSizing: 'border-box',
}

export default function ReservasPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<string>('active')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ customer_name: '', customer_phone: '', service: '', notes: '', slot_id: '' })
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
  const [catalogServices, setCatalogServices] = useState<Service[]>([])
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/appointments')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setAppointments(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchAppointments()
    fetch('/api/services').then(r => r.json()).then(d => setCatalogServices(Array.isArray(d) ? d : [])).catch(() => {})
  }, [fetchAppointments])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: updated.status } : a))
    }
    setUpdating(null)
  }

  async function openEdit(appt: Appointment) {
    setEditingId(appt.id)
    setEditError('')
    setEditForm({
      customer_name: appt.customer_name,
      customer_phone: appt.customer_phone,
      service: appt.service,
      notes: appt.notes ?? '',
      slot_id: appt.available_slots?.id ?? '',
    })
    // Cargar turnos disponibles para reasignación
    const res = await fetch('/api/slots')
    const data = await res.json()
    // Incluir el turno actual aunque esté ocupado
    const current = appt.available_slots
    const all = Array.isArray(data) ? data : []
    if (current && !all.find((s: Slot) => s.id === current.id)) {
      setAvailableSlots([current, ...all])
    } else {
      setAvailableSlots(all)
    }
  }

  function closeEdit() { setEditingId(null); setEditError('') }

  async function saveEdit(apptId: string) {
    setSaving(true)
    setEditError('')
    const res = await fetch(`/api/appointments/${apptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: editForm.customer_name,
        customer_phone: editForm.customer_phone,
        service: editForm.service,
        notes: editForm.notes || null,
        slot_id: editForm.slot_id || undefined,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setAppointments(prev => prev.map(a => a.id === apptId ? updated : a))
      setEditingId(null)
    } else {
      const err = await res.json()
      setEditError(err.error ?? 'Error al guardar')
    }
  }

  const filtered = appointments.filter(a => {
    if (filter === 'active') return ['pending', 'payment_received', 'confirmed'].includes(a.status)
    if (filter === 'all') return true
    return a.status === filter
  })

  const counts = {
    active: appointments.filter(a => ['pending', 'payment_received', 'confirmed'].includes(a.status)).length,
    payment_received: appointments.filter(a => a.status === 'payment_received').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    all: appointments.length,
  }

  return (
    <div className="admin-layout">
      <AdminNav />

      <div className="admin-content">
        <div className="schedule-header">
          <h1>Reservas</h1>
          <div className="res-summary">
            <span className="res-stat"><strong>{counts.active}</strong> activas</span>
            <span className="res-stat"><strong>{counts.completed}</strong> completadas</span>
            <span className="res-stat"><strong>{counts.cancelled}</strong> canceladas</span>
          </div>
        </div>

        <div className="res-filters">
          {[
            { key: 'active',           label: `Activas (${counts.active})` },
            { key: 'payment_received', label: `Seña recibida (${counts.payment_received})` },
            { key: 'pending',          label: `Pendientes (${counts.pending})` },
            { key: 'confirmed',        label: `Confirmadas (${counts.confirmed})` },
            { key: 'completed',        label: `Completadas (${counts.completed})` },
            { key: 'cancelled',        label: `Canceladas (${counts.cancelled})` },
            { key: 'all',              label: `Todas (${counts.all})` },
          ].map(f => (
            <button key={f.key} className={`res-filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="loading-msg">Cargando reservas...</p>}
        {!loading && filtered.length === 0 && <div className="res-empty"><p>No hay reservas en esta categoría.</p></div>}

        <div className="res-list">
          {filtered.map(appt => {
            const slot = appt.available_slots
            const isUpdating = updating === appt.id
            const isEditing = editingId === appt.id

            return (
              <div key={appt.id} className={`res-card res-card-${appt.status}`}>
                <div className="res-card-top">
                  <div className="res-client">
                    <span className="res-name">{appt.customer_name}</span>
                    <a href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="res-phone">
                      📱 {appt.customer_phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`res-badge ${STATUS_CLASS[appt.status]}`}>{STATUS_LABEL[appt.status]}</span>
                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() => isEditing ? closeEdit() : openEdit(appt)}
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer' }}
                      >
                        {isEditing ? '✕ Cerrar' : '✏️ Editar'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="res-card-body">
                  <div className="res-info-row">
                    <span className="res-label">Servicio</span>
                    <span className="res-value">{appt.service}</span>
                  </div>
                  {slot && (
                    <div className="res-info-row">
                      <span className="res-label">Turno</span>
                      <span className="res-value">{formatDate(slot.date)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                    </div>
                  )}
                  {appt.notes && (
                    <div className="res-info-row">
                      <span className="res-label">Notas</span>
                      <span className="res-value res-notes">{appt.notes}</span>
                    </div>
                  )}
                </div>

                {/* ── FORMULARIO DE EDICIÓN INLINE ── */}
                {isEditing && (
                  <div style={{ borderTop: '1px solid rgba(255,200,220,0.15)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>Editar reserva</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Nombre</p>
                        <input style={inputStyle} value={editForm.customer_name} onChange={e => setEditForm(f => ({ ...f, customer_name: e.target.value }))} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Teléfono</p>
                        <input style={inputStyle} value={editForm.customer_phone} onChange={e => setEditForm(f => ({ ...f, customer_phone: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Servicio</p>
                      <select style={inputStyle} value={editForm.service} onChange={e => setEditForm(f => ({ ...f, service: e.target.value }))}>
                        {editForm.service && !catalogServices.find(s => s.name === editForm.service) && (
                          <option value={editForm.service}>{editForm.service}</option>
                        )}
                        {Object.entries(
                          catalogServices.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc }, {} as Record<string, Service[]>)
                        ).map(([cat, svcs]) => (
                          <optgroup key={cat} label={cat}>
                            {svcs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {availableSlots.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Reprogramar turno</p>
                        <select style={inputStyle} value={editForm.slot_id} onChange={e => setEditForm(f => ({ ...f, slot_id: e.target.value }))}>
                          {availableSlots.map(s => (
                            <option key={s.id} value={s.id}>
                              {formatDate(s.date)} · {formatTime(s.start_time)}–{formatTime(s.end_time)}
                              {s.id === appt.available_slots?.id ? ' (actual)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: '0 0 0.3rem' }}>Notas</p>
                      <textarea
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      />
                    </div>

                    {editError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{editError}</p>}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={closeEdit} style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,200,220,0.2)', borderRadius: '6px', color: 'inherit', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(appt.id)}
                        disabled={saving}
                        className="res-btn res-btn-confirm"
                        style={{ flex: 2, opacity: saving ? 0.6 : 1 }}
                      >
                        {saving ? 'Guardando...' : '✓ Guardar cambios'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ACCIONES DE ESTADO ── */}
                {!isEditing && !['cancelled', 'no_show'].includes(appt.status) && (
                  <div className="res-card-actions">
                    {appt.status === 'payment_received' && (
                      <button className="res-btn res-btn-confirm" disabled={isUpdating} onClick={() => updateStatus(appt.id, 'confirmed')}>
                        ✓ Confirmar turno
                      </button>
                    )}
                    {appt.status === 'pending' && (
                      <button className="res-btn res-btn-confirm" disabled={isUpdating} onClick={() => updateStatus(appt.id, 'confirmed')}>
                        ✓ Confirmar seña
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button className="res-btn res-btn-complete" disabled={isUpdating} onClick={() => updateStatus(appt.id, 'completed')}>
                        ✓ Completado
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        className="res-btn res-btn-cancel"
                        disabled={isUpdating}
                        onClick={() => {
                          if (confirm(`¿Marcar a ${appt.customer_name} como no presentado?`))
                            updateStatus(appt.id, 'no_show')
                        }}
                      >
                        No asistió
                      </button>
                    )}
                    {appt.status !== 'completed' && (
                      <button
                        className="res-btn res-btn-cancel"
                        disabled={isUpdating}
                        onClick={() => {
                          if (confirm(`¿Cancelar la reserva de ${appt.customer_name}? El turno quedará disponible nuevamente.`))
                            updateStatus(appt.id, 'cancelled')
                        }}
                      >
                        ✕ Cancelar
                      </button>
                    )}
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
