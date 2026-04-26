'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DAYS = [
  { day: 1, label: 'Lunes' },
  { day: 2, label: 'Martes' },
  { day: 3, label: 'Miércoles' },
  { day: 4, label: 'Jueves' },
  { day: 5, label: 'Viernes' },
  { day: 6, label: 'Sábado' },
  { day: 0, label: 'Domingo' },
]

interface DayHours {
  day_of_week: number
  is_open: boolean
  open_time: string
  close_time: string
}

interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

function formatDisplayDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-PY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function HorariosPage() {
  const router = useRouter()
  const [hours, setHours] = useState<DayHours[]>([])
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [addingDate, setAddingDate] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/business-hours').then(r => r.json()),
      fetch('/api/blocked-dates').then(r => r.json()),
    ]).then(([h, b]) => {
      if (h.error) { router.push('/admin/login'); return }
      // Merge con orden definido en DAYS
      const map: Record<number, DayHours> = {}
      h.forEach((row: any) => { map[row.day_of_week] = row })
      setHours(DAYS.map(d => map[d.day] ?? { day_of_week: d.day, is_open: false, open_time: '08:00', close_time: '20:00' }))
      setBlocked(Array.isArray(b) ? b : [])
      setLoading(false)
    })
  }, [router])

  function updateDay(day: number, field: keyof DayHours, value: any) {
    setHours(prev => prev.map(h => h.day_of_week === day ? { ...h, [field]: value } : h))
    setSaved(false)
  }

  async function saveHours() {
    setSaving(true)
    const res = await fetch('/api/business-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  async function addBlockedDate() {
    if (!newDate) return
    setAddingDate(true)
    const res = await fetch('/api/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate, reason: newReason || null }),
    })
    if (res.ok) {
      const data = await res.json()
      setBlocked(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
      setNewDate('')
      setNewReason('')
    }
    setAddingDate(false)
  }

  async function removeBlockedDate(id: string) {
    await fetch(`/api/blocked-dates?id=${id}`, { method: 'DELETE' })
    setBlocked(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return <div className="admin-layout"><div className="admin-content"><p className="loading-msg">Cargando...</p></div></div>

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <span className="logo-text">💅 Era Nails & Hair — Admin</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/admin/schedule" className="admin-nav-link">Turnos</a>
          <a href="/admin/reservas" className="admin-nav-link">Reservas</a>
          <a href="/admin/horarios" className="admin-nav-link active">Horarios</a>
          <a href="/admin/pagos" className="admin-nav-link">Pagos</a>
          <a href="/admin/crm" className="admin-nav-link">CRM</a>
          <a href="/" style={{ opacity: 0.6, fontSize: '0.85rem' }}>← Sitio</a>
        </div>
      </nav>

      <div className="admin-content">
        <div className="schedule-header">
          <h1>Horarios de Atención</h1>
        </div>

        {/* ── Horarios por día ── */}
        <div className="horarios-card">
          <h2 className="horarios-section-title">Días y horarios de apertura</h2>
          <p className="horarios-hint">Configurá en qué días y horarios atendés clientes.</p>

          <div className="horarios-table">
            <div className="horarios-thead">
              <span>Día</span>
              <span>Abierto</span>
              <span>Apertura</span>
              <span>Cierre</span>
            </div>
            {DAYS.map(({ day, label }) => {
              const row = hours.find(h => h.day_of_week === day)
              if (!row) return null
              return (
                <div key={day} className={`horarios-row${row.is_open ? '' : ' horarios-row-closed'}`}>
                  <span className="horarios-day">{label}</span>
                  <label className="horarios-toggle">
                    <input
                      type="checkbox"
                      checked={row.is_open}
                      onChange={e => updateDay(day, 'is_open', e.target.checked)}
                    />
                    <span className="horarios-toggle-slider" />
                  </label>
                  <input
                    type="time"
                    className="horarios-time-input"
                    value={row.open_time ?? '08:00'}
                    disabled={!row.is_open}
                    onChange={e => updateDay(day, 'open_time', e.target.value)}
                  />
                  <input
                    type="time"
                    className="horarios-time-input"
                    value={row.close_time ?? '20:00'}
                    disabled={!row.is_open}
                    onChange={e => updateDay(day, 'close_time', e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.7rem 2rem' }}
              onClick={saveHours}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar horarios'}
            </button>
            {saved && <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✓ Guardado correctamente</span>}
          </div>
        </div>

        {/* ── Días bloqueados ── */}
        <div className="horarios-card" style={{ marginTop: '2rem' }}>
          <h2 className="horarios-section-title">Días de descanso y feriados</h2>
          <p className="horarios-hint">Agregá días específicos en los que no atendés (vacaciones, feriados, etc.).</p>

          {/* Agregar nuevo */}
          <div className="blocked-add-row">
            <input
              type="date"
              className="horarios-time-input"
              style={{ flex: '0 0 auto' }}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
            <input
              type="text"
              className="horarios-time-input"
              placeholder="Motivo (opcional)"
              style={{ flex: 1 }}
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.6rem 1.4rem', whiteSpace: 'nowrap' }}
              onClick={addBlockedDate}
              disabled={!newDate || addingDate}
            >
              + Agregar
            </button>
          </div>

          {/* Lista */}
          {blocked.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
              No hay días de descanso configurados.
            </p>
          ) : (
            <div className="blocked-list">
              {blocked.map(b => (
                <div key={b.id} className="blocked-item">
                  <div>
                    <span className="blocked-date">{formatDisplayDate(b.date)}</span>
                    {b.reason && <span className="blocked-reason">{b.reason}</span>}
                  </div>
                  <button
                    className="slot-del"
                    style={{ position: 'static', fontSize: '1rem', padding: '0.2rem 0.6rem' }}
                    onClick={() => removeBlockedDate(b.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
