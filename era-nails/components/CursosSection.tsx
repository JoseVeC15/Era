export default function CursosSection() {
  return (
    <section id="cursos" className="servicios" style={{ background: 'var(--bg-deep)' }}>
      <div className="section-header">
        <h2 className="section-title">Cursos &amp; Capacitaciones</h2>
        <p className="section-tagline">Formación profesional con técnicas internacionales de vanguardia</p>
        <div className="title-underline"></div>
      </div>
      <div className="servicios-grid">
        <div className="service-item">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">🎓</span><h3>Certificación Plástica de Pies</h3></div>
            <p className="service-desc">Domina la técnica original brasileña. Aprende protocolos de quiropodia y podología estética avanzada.</p>
            <ul className="price-detail">
              <li><span>Teoría y Bioseguridad</span></li>
              <li><span>Práctica en Modelos Reales</span></li>
              <li><span>Kit de Inicio Incluido</span></li>
              <li><span>Certificación Internacional</span></li>
            </ul>
          </div>
        </div>
        <div className="service-item">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">👩‍🏫</span><h3>Master en Sistemas de Uñas</h3></div>
            <p className="service-desc">Capacitación completa en Acrílico, Gel y Polygel. Desde nivel inicial hasta perfeccionamiento.</p>
            <ul className="price-detail">
              <li><span>Estructuras Modernas</span></li>
              <li><span>Manicura Rusa Combinada</span></li>
              <li><span>Diseño y Nail Art</span></li>
              <li><span>Manejo de Tornos y Fresas</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <a href="https://wa.me/595984704144?text=Hola!%20Deseo%20información%20sobre%20los%20cursos" target="_blank" className="btn-reserva" style={{ display: 'inline-flex', width: 'auto', margin: '0 auto' }}>
          CONSULTAR FECHAS DISPONIBLES
        </a>
      </div>
    </section>
  )
}
