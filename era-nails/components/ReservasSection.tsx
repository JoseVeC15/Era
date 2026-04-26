'use client'
import { useEffect, useState } from 'react'
import { buildWhatsAppURL, formatDate, formatTime, slotDurationLabel } from '@/lib/utils'

interface Slot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface GroupedSlots {
  [date: string]: Slot[]
}

export default function ReservasSection() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then(data => { setSlots(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped: GroupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {} as GroupedSlots)

  return (
    <section id="reservas" className="reservas-section">
      <div className="section-header">
        <h2 className="section-title">Turnos Disponibles</h2>
        <p className="section-tagline">
          Reserva tu turno por WhatsApp — se requiere seña de ₲50.000 para confirmar
        </p>
        <div className="title-underline"></div>
      </div>

      <div className="reservas-grid">
        {loading && (
          <p className="slots-loading-msg">Cargando turnos disponibles...</p>
        )}

        {!loading && slots.length === 0 && (
          <div className="no-slots-msg">
            <p>No hay turnos disponibles por el momento.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Contactanos por WhatsApp para consultar disponibilidad.
            </p>
            <a
              href="https://wa.me/595984704144?text=Hola!%20Quiero%20consultar%20disponibilidad%20de%20turnos"
              target="_blank"
              rel="noopener noreferrer"
              className="slot-wa-btn"
              style={{ margin: '1rem auto 0' }}
            >
              <i className="fab fa-whatsapp"></i>
              Consultar por WhatsApp
            </a>
          </div>
        )}

        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySlots]) => (
          <div key={date} className="date-group">
            <p className="date-group-title">{formatDate(date)}</p>
            <div className="reservas-grid" style={{ margin: 0 }}>
              {daySlots.map(slot => {
                const waUrl = buildWhatsAppURL(slot.date, slot.start_time, slot.end_time)
                return (
                  <div key={slot.id} className="slot-card">
                    <p className="slot-date-label">{formatDate(slot.date)}</p>
                    <p className="slot-time-display">
                      {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                    </p>
                    <p className="slot-duration-text">Duración: {slotDurationLabel(slot.start_time, slot.end_time)}</p>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="slot-wa-btn"
                    >
                      <i className="fab fa-whatsapp"></i>
                      Reservar este turno
                    </a>
                    <p className="seña-notice">
                      💳 Seña de ₲50.000 para confirmar reserva
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
