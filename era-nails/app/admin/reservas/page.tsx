'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  service: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  available_slots: Slot | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-PY', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}
function formatTime(t: string) { return t.slice(0, 5) }

export default function ReservasPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<string>('active')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/appointments')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setAppointments(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

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

  const filtered = appointments.filter(a => {
    if (filter === 'active') return a.status === 'pending' || a.status === 'confirmed'
    if (filter === 'all') return true
    return a.status === filter
  })

  const counts = {
    active: appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    all: appointments.length,
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <span className="logo-text">💅 Era Nails & Hair — Admin</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/admin/schedule" className="admin-nav-link">Turnos</a>
          <a href="/admin/reservas" className="admin-nav-link active">Reservas</a>
          <a href="/admin/horarios" className="admin-nav-link">Horarios</a>
          <a href="/admin/pagos" className="admin-nav-link">Pagos</a>
          <a href="/admin/crm" className="admin-nav-link">CRM</a>
          <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
        </div>
      </nav>

      <div className="admin-content">
        <div className="schedule-header">
          <h1>Reservas</h1>
          <div className="res-summary">
            <span className="res-stat"><strong>{counts.active}</strong> activas</span>
            <span className="res-stat"><strong>{counts.completed}</strong> completadas</span>
            <span className="res-stat"><strong>{counts.cancelled}</strong> canceladas</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="res-filters">
          {[
            { key: 'active', label: `Activas (${counts.active})` },
            { key: 'pending', label: `Pendientes (${counts.pending})` },
            { key: 'confirmed', label: `Confirmadas (${counts.confirmed})` },
            { key: 'completed', label: `Completadas (${counts.completed})` },
            { key: 'cancelled', label: `Canceladas (${counts.cancelled})` },
            { key: 'all', label: `Todas (${counts.all})` },
          ].map(f => (
            <button
              key={f.key}
              className={`res-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="loading-msg">Cargando reservas...</p>}

        {!loading && filtered.length === 0 && (
          <div className="res-empty">
            <p>No hay reservas en esta categoría.</p>
          </div>
        )}

        <div className="res-list">
          {filtered.map(appt => {
            const slot = appt.available_slots
            const isUpdating = updating === appt.id
            return (
              <div key={appt.id} className={`res-card res-card-${appt.status}`}>
                <div className="res-card-top">
                  <div className="res-client">
                    <span className="res-name">{appt.customer_name}</span>
                    <a
                      href={`https://wa.me/${appt.customer_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="res-phone"
                    >
                      📱 {appt.customer_phone}
                    </a>
                  </div>
                  <span className={`res-badge ${STATUS_CLASS[appt.status]}`}>
                    {STATUS_LABEL[appt.status]}
                  </span>
                </div>

                <div className="res-card-body">
                  <div className="res-info-row">
                    <span className="res-label">Servicio</span>
                    <span className="res-value">{appt.service}</span>
                  </div>
                  {slot && (
                    <div className="res-info-row">
                      <span className="res-label">Turno</span>
                      <span className="res-value">
                        {formatDate(slot.date)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </span>
                    </div>
                  )}
                  {appt.notes && (
                    <div className="res-info-row">
                      <span className="res-label">Notas</span>
                      <span className="res-value res-notes">{appt.notes}</span>
                    </div>
                  )}
                </div>

                {(appt.status === 'pending' || appt.status === 'confirmed') && (
                  <div className="res-card-actions">
                    {appt.status === 'pending' && (
                      <button
                        className="res-btn res-btn-confirm"
                        disabled={isUpdating}
                        onClick={() => updateStatus(appt.id, 'confirmed')}
                      >
                        ✓ Confirmar
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        className="res-btn res-btn-complete"
                        disabled={isUpdating}
                        onClick={() => updateStatus(appt.id, 'completed')}
                      >
                        ✓ Marcar completado
                      </button>
                    )}
                    <button
                      className="res-btn res-btn-cancel"
                      disabled={isUpdating}
                      onClick={() => {
                        if (confirm(`¿Cancelar la reserva de ${appt.customer_name}? El turno quedará disponible nuevamente.`))
                          updateStatus(appt.id, 'cancelled')
                      }}
                    >
                      ✕ Cancelar reserva
                    </button>
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
