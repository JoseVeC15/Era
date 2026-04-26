'use client'
import { useEffect, useState } from 'react'
import { formatDate, formatTime, slotDurationLabel } from '@/lib/utils'

type Step = 'list' | 'form' | 'success' | 'taken'

interface Slot { id: string; date: string; start_time: string; end_time: string }

const SERVICES = [
  'Plástica de Pies Básica',
  'Plástica con Diseño Tradicional',
  'Plástica con Semi Gel',
  'Plástica con Semi French',
  'Uñas Acrílicas Cortas',
  'Uñas Acrílicas Largas',
  'Gel Esculpido',
  'Polygel',
  'Kapping',
  'Manicura',
  'Otro',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(245,210,230,0.25)',
  borderRadius: '8px',
  color: 'var(--quartz)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'rgba(245,210,230,0.6)',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export default function ReservasSection() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('list')
  const [selected, setSelected] = useState<Slot | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then(data => { setSlots(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, Slot[]>)

  function openForm(slot: Slot) {
    setSelected(slot)
    setName(''); setPhone(''); setService(''); setNotes('')
    setStep('form')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !name.trim() || !phone.trim() || !service) return
    setSubmitting(true)

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot_id: selected.id,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        service,
        notes: notes.trim() || undefined,
      }),
    })

    setSubmitting(false)

    if (res.ok) {
      setSlots(prev => prev.filter(s => s.id !== selected.id))
      setStep('success')
    } else {
      const data = await res.json()
      if (data.error?.includes('disponible')) setStep('taken')
      else setStep('taken')
    }
  }

  const waDepositUrl = selected
    ? `https://wa.me/595984704144?text=${encodeURIComponent(`Hola! Me reservé el turno del ${formatDate(selected.date)} a las ${formatTime(selected.start_time)}. Envío la seña de ₲50.000 para confirmar. Mi nombre es ${name}.`)}`
    : 'https://wa.me/595984704144'

  // ── FORMULARIO ───────────────────────────────────────────────────────────
  if (step === 'form' && selected) {
    return (
      <section id="reservas" className="reservas-section">
        <div className="section-header">
          <h2 className="section-title">Completá tu Reserva</h2>
          <div className="title-underline"></div>
        </div>

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Resumen del turno seleccionado */}
          <div className="slot-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <p className="slot-date-label">{formatDate(selected.date)}</p>
            <p className="slot-time-display">{formatTime(selected.start_time)} — {formatTime(selected.end_time)}</p>
            <p className="slot-duration-text">Duración: {slotDurationLabel(selected.start_time, selected.end_time)}</p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                style={inputStyle}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label style={labelStyle}>WhatsApp *</label>
              <input
                style={inputStyle}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+595 9XX XXX XXX"
                required
                maxLength={30}
              />
            </div>

            <div>
              <label style={labelStyle}>Servicio *</label>
              <select
                style={inputStyle}
                value={service}
                onChange={e => setService(e.target.value)}
                required
              >
                <option value="">Seleccioná un servicio</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notas adicionales (opcional)</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Diseño especial, alergia a algún producto, etc."
                maxLength={300}
              />
            </div>

            <p className="seña-notice" style={{ textAlign: 'center' }}>
              💳 Se requiere seña de ₲50.000 para confirmar. Te enviamos el link de pago por WhatsApp.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setStep('list')}
                style={{ flex: 1, padding: '0.85rem', background: 'transparent', border: '1px solid rgba(245,210,230,0.3)', borderRadius: '8px', color: 'var(--quartz)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ← Volver
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !phone.trim() || !service}
                className="slot-wa-btn"
                style={{ flex: 2, opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        </div>
      </section>
    )
  }

  // ── ÉXITO ─────────────────────────────────────────────────────────────────
  if (step === 'success' && selected) {
    return (
      <section id="reservas" className="reservas-section">
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '2rem 1rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</p>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>¡Turno reservado!</h2>
          <p style={{ color: 'var(--quartz)', opacity: 0.8, marginBottom: '0.5rem' }}>
            {formatDate(selected.date)} · {formatTime(selected.start_time)} — {formatTime(selected.end_time)}
          </p>
          <p style={{ color: 'var(--quartz)', opacity: 0.8, marginBottom: '2rem' }}>
            Tu reserva está en estado <strong>pendiente</strong>. Para confirmarla, enviá la seña de ₲50.000 por WhatsApp.
          </p>
          <a href={waDepositUrl} target="_blank" rel="noopener noreferrer" className="slot-wa-btn" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <i className="fab fa-whatsapp"></i>
            Enviar seña por WhatsApp
          </a>
          <br />
          <button
            onClick={() => { setStep('list'); setSelected(null) }}
            style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--quartz)', opacity: 0.6, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Ver otros turnos
          </button>
        </div>
      </section>
    )
  }

  // ── TURNO OCUPADO ──────────────────────────────────────────────────────────
  if (step === 'taken') {
    return (
      <section id="reservas" className="reservas-section">
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '2rem 1rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</p>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>Turno no disponible</h2>
          <p style={{ color: 'var(--quartz)', opacity: 0.8, marginBottom: '2rem' }}>
            Alguien se adelantó y ese turno acaba de ser reservado. Elegí otro horario.
          </p>
          <button
            onClick={() => { setStep('list'); setSelected(null) }}
            className="slot-wa-btn"
          >
            Ver turnos disponibles
          </button>
        </div>
      </section>
    )
  }

  // ── LISTA DE TURNOS (default) ─────────────────────────────────────────────
  return (
    <section id="reservas" className="reservas-section">
      <div className="section-header">
        <h2 className="section-title">Turnos Disponibles</h2>
        <p className="section-tagline">
          Reservá tu turno online — se requiere seña de ₲50.000 para confirmar
        </p>
        <div className="title-underline"></div>
      </div>

      <div className="reservas-grid">
        {loading && <p className="slots-loading-msg">Cargando turnos disponibles...</p>}

        {!loading && slots.length === 0 && (
          <div className="no-slots-msg">
            <p>No hay turnos disponibles por el momento.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Contactanos por WhatsApp para consultar disponibilidad.</p>
            <a href="https://wa.me/595984704144?text=Hola!%20Quiero%20consultar%20disponibilidad%20de%20turnos" target="_blank" rel="noopener noreferrer" className="slot-wa-btn" style={{ margin: '1rem auto 0' }}>
              <i className="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
          </div>
        )}

        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySlots]) => (
          <div key={date} className="date-group">
            <p className="date-group-title">{formatDate(date)}</p>
            <div className="reservas-grid" style={{ margin: 0 }}>
              {daySlots.map(slot => (
                <div key={slot.id} className="slot-card">
                  <p className="slot-date-label">{formatDate(slot.date)}</p>
                  <p className="slot-time-display">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</p>
                  <p className="slot-duration-text">Duración: {slotDurationLabel(slot.start_time, slot.end_time)}</p>
                  <button onClick={() => openForm(slot)} className="slot-wa-btn" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>
                    Reservar este turno
                  </button>
                  <p className="seña-notice">💳 Seña de ₲50.000 para confirmar</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
