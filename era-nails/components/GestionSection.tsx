const features = [
  { icon: '🕐', title: 'Reservas 24/7', desc: 'Agendá tu turno en cualquier momento desde el catálogo, sin necesidad de llamar o esperar respuesta.' },
  { icon: '📅', title: 'Sincronización con Google Calendar', desc: 'Conexión bidireccional que evita solapamientos y mantiene la agenda siempre actualizada en tiempo real.' },
  { icon: '👥', title: 'Gestión de Equipos', desc: 'Administración de agendas de múltiples profesionales bajo una misma marca, de forma centralizada.' },
  { icon: '📋', title: 'Ficha de Clientes (CRM)', desc: 'Historial detallado de cada clienta, preferencias, servicios anteriores y notas de seguimiento personalizadas.' },
  { icon: '💳', title: 'Pasarelas de Pago', desc: 'Integración con los sistemas de pago locales de Paraguay para confirmar reservas de forma segura y rápida.' },
  { icon: '💰', title: 'Sistema de Señas', desc: 'Cobrá un adelanto automático para confirmar la reserva y reducir significativamente el ausentismo.' },
  { icon: '🌍', title: 'Múltiples Monedas', desc: 'Plataforma adaptable a diferentes mercados y monedas, lista para escalar a cualquier región.' },
]

export default function GestionSection() {
  return (
    <section className="gestion-section">
      <div className="section-header">
        <h2 className="section-title">Gestión &amp; Agenda Inteligente</h2>
        <p className="section-tagline">Tecnología avanzada al servicio de tu experiencia</p>
        <div className="title-underline"></div>
      </div>
      <div className="gestion-grid">
        {features.map((item, i) => (
          <div key={i} className="gestion-card">
            <div className="gestion-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
