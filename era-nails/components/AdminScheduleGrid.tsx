'use client'
import { useState, useEffect, useCallback } from 'react'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  service?: string | null
}

interface DayOff { date: string }

const HOUR_START = 6
const HOUR_END = 21
const DURATIONS = [60, 90, 120, 150, 180, 240]
const TOTAL_MINS = (HOUR_END - HOUR_START) * 60
const COL_HEIGHT = 600

const SERVICE_PALETTE = [
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  { bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' },
  { bg: '#fce8ec', text: '#881337', border: '#fda4af' },
]

function serviceColor(service?: string | null) {
  if (!service) return { bg: 'var(--surface)', text: 'var(--text-muted)', border: 'var(--border)' }
  let hash = 0
  for (let i = 0; i < service.length; i++) hash = (hash * 31 + service.charCodeAt(i)) & 0xffffffff
  return SERVICE_PALETTE[Math.abs(hash) % SERVICE_PALETTE.length]
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })
}
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0); return d
}
function toDateStr(d: Date) { return d.toISOString().split('T')[0] }

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
function formatDuration(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
function timeToY(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return ((h * 60 + m - HOUR_START * 60) / TOTAL_MINS) * COL_HEIGHT
}

function buildTimeOptions(): string[] {
  const opts: string[] = []
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
}
const ALL_TIMES = buildTimeOptions()
const HOUR_LINES = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i)

export default function AdminScheduleGrid() {
  const [view, setView] = useState<'cards' | 'cal'>('cards')
  const [monday, setMonday] = useState<Date>(getMondayOf(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [daysOff, setDaysOff] = useState<DayOff[]>([])
  const [loading, setLoading] = useState(false)

  const [modal, setModal] = useState<{ date: string; dateLabel: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTime, setFormTime] = useState('06:00')
  const [formDuration, setFormDuration] = useState(120)
  const [formService, setFormService] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const weekDays = getWeekDays(monday)
  const weekLabel = `${weekDays[0].toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })} — ${weekDays[6].toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })}`

  const fetchData = useCallback(async () => {
    setLoading(true)
    const from = toDateStr(weekDays[0]), to = toDateStr(weekDays[6])
    const [sRes, dRes] = await Promise.all([
      fetch(`/api/slots/week?from=${from}&to=${to}`),
      fetch(`/api/days-off?from=${from}&to=${to}`),
    ])
    const [sData, dData] = await Promise.all([sRes.json(), dRes.json()])
    setSlots(Array.isArray(sData) ? sData : [])
    setDaysOff(Array.isArray(dData) ? dData : [])
    setLoading(false)
  }, [monday]) // eslint-disable-line

  useEffect(() => { fetchData() }, [fetchData])

  const allServices = Array.from(new Set(slots.map(s => s.service).filter(Boolean))) as string[]

  function getAvailableTimes(date: string) {
    return ALL_TIMES.filter(t =>
      !slots.some(s => s.date === date && s.start_time.slice(0, 5) <= t && s.end_time.slice(0, 5) > t)
    )
  }

  function openModal(date: string, preferredTime?: string) {
    const d = new Date(date + 'T12:00:00')
    const dateLabel = d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const times = getAvailableTimes(date)
    const time = preferredTime && times.includes(preferredTime) ? preferredTime : (times[0] ?? '06:00')
    setEditingId(null)
    setFormTime(time)
    setFormDuration(120)
    setFormService('')
    setSaveError('')
    setModal({ date, dateLabel })
  }

  function openEdit(slot: Slot) {
    const d = new Date(slot.date + 'T12:00:00')
    const dateLabel = d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const [sh, sm] = slot.start_time.split(':').map(Number)
    const [eh, em] = slot.end_time.split(':').map(Number)
    const duration = (eh * 60 + em) - (sh * 60 + sm)
    setEditingId(slot.id)
    setFormTime(slot.start_time.slice(0, 5))
    setFormDuration(DURATIONS.includes(duration) ? duration : 120)
    setFormService(slot.service ?? '')
    setSaveError('')
    setModal({ date: slot.date, dateLabel })
  }

  function getDurationOptions(date: string, startTime: string) {
    return DURATIONS.map(d => {
      const end = addMinutes(startTime, d)
      const overflow = end > `${String(HOUR_END).padStart(2, '0')}:00`
      const conflict = slots.some(s =>
        s.id !== editingId &&
        s.date === date && s.start_time.slice(0, 5) < end && s.end_time.slice(0, 5) > startTime
      )
      return { mins: d, label: formatDuration(d), disabled: overflow || conflict }
    })
  }

  async function handleSave() {
    if (!modal) return
    const endTime = addMinutes(formTime, formDuration)
    setSaving(true)
    setSaveError('')
    const res = editingId
      ? await fetch(`/api/slots/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: modal.date, start_time: formTime, end_time: endTime, service: formService || null }),
        })
      : await fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: modal.date, start_time: formTime, end_time: endTime, service: formService || null }),
        })
    setSaving(false)
    if (res.ok) { setModal(null); fetchData() }
    else {
      const err = await res.json().catch(() => ({}))
      setSaveError(err.error ?? 'Error al guardar. Intentá de nuevo.')
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/slots/${id}`, { method: 'DELETE' })
    if (res.ok) setSlots(prev => prev.filter(s => s.id !== id))
  }

  async function toggleDayOff(date: string) {
    const isOff = daysOff.some(d => d.date === date)
    if (isOff) {
      const res = await fetch(`/api/days-off/${date}`, { method: 'DELETE' })
      if (res.ok) setDaysOff(prev => prev.filter(d => d.date !== date))
    } else {
      const res = await fetch('/api/days-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (res.ok) setDaysOff(prev => [...prev, { date }])
    }
  }

  function handleCalColClick(date: string, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const minsFromStart = Math.round((y / COL_HEIGHT) * TOTAL_MINS / 30) * 30
    const totalMins = HOUR_START * 60 + Math.min(minsFromStart, TOTAL_MINS - 30)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    openModal(date, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  const durationOpts = modal ? getDurationOptions(modal.date, formTime) : []
  const previewEnd = addMinutes(formTime, formDuration)

  return (
    <div>
      {/* ── Encabezado ── */}
      <div className="schedule-header">
        <h1>Calendario Semanal</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="view-toggle">
            <button className={`view-btn${view === 'cards' ? ' active' : ''}`} onClick={() => setView('cards')}>
              ▦ Tarjetas
            </button>
            <button className={`view-btn${view === 'cal' ? ' active' : ''}`} onClick={() => setView('cal')}>
              📅 Calendario
            </button>
          </div>
          <div className="week-nav">
            <button onClick={() => { const p = new Date(monday); p.setDate(p.getDate() - 7); setMonday(p) }}>← Anterior</button>
            <span className="week-label">{weekLabel}</span>
            <button onClick={() => { const n = new Date(monday); n.setDate(n.getDate() + 7); setMonday(n) }}>Siguiente →</button>
          </div>
        </div>
      </div>

      {/* ── Leyenda de servicios ── */}
      {allServices.length > 0 && (
        <div className="service-legend">
          {allServices.map(s => {
            const c = serviceColor(s)
            return (
              <span key={s} className="service-legend-chip" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                {s}
              </span>
            )
          })}
        </div>
      )}

      {loading && <p className="loading-msg">Cargando...</p>}

      {/* ── Vista tarjetas ── */}
      {view === 'cards' && (
        <div className="week-cards">
          {weekDays.map(day => {
            const dateStr = toDateStr(day)
            const isOff = daysOff.some(o => o.date === dateStr)
            const daySlots = slots.filter(s => s.date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time))
            const dayName = day.toLocaleDateString('es-PY', { weekday: 'long' })
            const dayNum = day.toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })
            return (
              <div key={dateStr} className={`day-card${isOff ? ' day-card-off' : ''}`}>
                <div className="day-card-head">
                  <div>
                    <div className="day-card-name">{dayName}</div>
                    <div className="day-card-date">{dayNum}</div>
                  </div>
                  <button
                    className={`btn-toggle-off${isOff ? ' active' : ''}`}
                    onClick={() => toggleDayOff(dateStr)}
                  >
                    {isOff ? '🔒 Libre' : 'Marcar libre'}
                  </button>
                </div>
                {isOff ? (
                  <div className="day-off-label">Día no laborable</div>
                ) : (
                  <div className="day-card-body">
                    {daySlots.length === 0
                      ? <p className="no-slots-text">Sin turnos cargados</p>
                      : (
                        <div className="slots-list">
                          {daySlots.map(slot => {
                            const c = serviceColor(slot.service)
                            return (
                              <div
                                key={slot.id}
                                className={`slot-row${slot.is_booked ? ' slot-booked' : ''}`}
                                style={slot.service ? { borderLeft: `3px solid ${c.border}` } : {}}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                  <span className="slot-row-time">
                                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                                  </span>
                                  {slot.service && (
                                    <span className="slot-service-tag" style={{ background: c.bg, color: c.text }}>
                                      {slot.service}
                                    </span>
                                  )}
                                </div>
                                {slot.is_booked
                                  ? <span className="slot-badge-booked">✓ Reservado</span>
                                  : (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button className="slot-row-edit" onClick={() => openEdit(slot)} title="Editar">✎</button>
                                      <button className="slot-row-del" onClick={() => handleDelete(slot.id)} title="Eliminar">✕</button>
                                    </div>
                                  )
                                }
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                    <button className="btn-add-slot" onClick={() => openModal(dateStr)}>+ Agregar turno</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Vista calendario ── */}
      {view === 'cal' && (
        <div className="schedule-wrap">
          <div className="cal-container">
            <div className="cal-headers">
              <div className="cal-gutter-header" />
              {weekDays.map(day => {
                const dateStr = toDateStr(day)
                const isOff = daysOff.some(o => o.date === dateStr)
                return (
                  <div
                    key={dateStr}
                    className={`cal-day-header${isOff ? ' day-off-header' : ''}`}
                    onClick={() => toggleDayOff(dateStr)}
                    title={isOff ? 'Clic para activar este día' : 'Clic para marcar como día libre'}
                  >
                    <strong>{day.toLocaleDateString('es-PY', { weekday: 'short' })}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', marginTop: '2px' }}>
                      {day.toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })}
                    </span>
                    {isOff && <span className="day-off-badge">🔒 Libre</span>}
                  </div>
                )
              })}
            </div>

            <div className="cal-body">
              <div className="cal-time-axis" style={{ height: COL_HEIGHT }}>
                {HOUR_LINES.map(h => (
                  <div key={h} className="cal-time-label" style={{ top: timeToY(`${String(h).padStart(2, '0')}:00`) }}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {weekDays.map(day => {
                const dateStr = toDateStr(day)
                const isOff = daysOff.some(o => o.date === dateStr)
                const daySlots = slots.filter(s => s.date === dateStr)
                return (
                  <div
                    key={dateStr}
                    className={`cal-day-col${isOff ? ' cal-day-off' : ''}`}
                    style={{ height: COL_HEIGHT }}
                    onClick={e => { if (!isOff) handleCalColClick(dateStr, e) }}
                  >
                    {HOUR_LINES.map(h => (
                      <div key={h} className="cal-hline hour" style={{ top: timeToY(`${String(h).padStart(2, '0')}:00`) }} />
                    ))}
                    {daySlots.map(slot => {
                      const top = timeToY(slot.start_time.slice(0, 5))
                      const height = Math.max(timeToY(slot.end_time.slice(0, 5)) - top, 20)
                      const c = serviceColor(slot.service)
                      return (
                        <div
                          key={slot.id}
                          className={`cal-slot${slot.is_booked ? ' booked' : ''}`}
                          style={{
                            top, height,
                            background: slot.is_booked ? undefined : c.bg,
                            borderLeft: `3px solid ${slot.is_booked ? 'var(--accent)' : c.border}`,
                          }}
                          onClick={e => { e.stopPropagation(); if (!slot.is_booked) openEdit(slot) }}
                          title={slot.is_booked ? 'Reservado' : 'Clic para editar'}
                        >
                          <span className="cal-slot-time" style={{ color: slot.is_booked ? undefined : c.text }}>
                            {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                          </span>
                          {slot.service && !slot.is_booked && (
                            <span className="cal-slot-service" style={{ color: c.text }}>{slot.service}</span>
                          )}
                          {slot.is_booked
                            ? <span className="cal-slot-badge">✓ Reservado</span>
                            : (
                              <button className="slot-del" onClick={e => { e.stopPropagation(); handleDelete(slot.id) }} title="Eliminar">✕</button>
                            )
                          }
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            Clic en el nombre del día para marcarlo libre · Clic en el horario vacío para agregar turno
          </p>
        </div>
      )}

      {/* ── Modal (compartido) ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h2 className="modal-title">{editingId ? 'Editar turno' : 'Nuevo turno'}</h2>
            <p className="modal-subtitle">{modal.dateLabel}</p>

            <div className="modal-field">
              <label>Servicio</label>
              <input
                type="text"
                list="service-suggestions"
                className="horarios-time-input"
                style={{ width: '100%' }}
                placeholder="Ej: Manicure, Pedicure, Acrílico…"
                value={formService}
                onChange={e => setFormService(e.target.value)}
              />
              <datalist id="service-suggestions">
                {allServices.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="modal-field">
              <label>Hora de inicio</label>
              <select
                value={formTime}
                onChange={e => {
                  setFormTime(e.target.value)
                  const opts = getDurationOptions(modal.date, e.target.value)
                  if (opts.find(o => o.mins === formDuration)?.disabled) {
                    const first = opts.find(o => !o.disabled)
                    if (first) setFormDuration(first.mins)
                  }
                }}
              >
                {getAvailableTimes(modal.date).map(t => (
                  <option key={t} value={t}>{t} hs</option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Duración del servicio</label>
              <div className="dur-grid">
                {durationOpts.map(({ mins, label, disabled }) => (
                  <button
                    key={mins}
                    className={`dur-chip${formDuration === mins ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                    disabled={disabled}
                    onClick={() => setFormDuration(mins)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-preview" style={formService ? (() => { const c = serviceColor(formService); return { background: c.bg, borderColor: c.border, color: c.text } })() : {}}>
              {formService && <span style={{ fontWeight: 600 }}>{formService}</span>}
              <span>⏰</span>
              <span>
                <strong>{formTime}</strong> hasta <strong>{previewEnd}</strong>
                {' '}({formatDuration(formDuration)})
              </span>
            </div>

            {saveError && <p className="modal-error">{saveError}</p>}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-confirm-slot" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editingId ? '✓ Guardar cambios' : '✓ Confirmar turno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
