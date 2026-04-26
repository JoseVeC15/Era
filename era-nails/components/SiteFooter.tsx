export default function SiteFooter() {
  return (
    <>
      <section className="cta-final">
        <div className="cta-content">
          <h2 className="cta-title">Reserva Tu Cita</h2>
          <p className="cta-subtitle">Accede a servicios de belleza premium con estándares de calidad internacional</p>
          <p className="cta-info">Disponibilidad limitada • Seña ₲50.000 para confirmar</p>
          <a href="https://wa.me/595984704144?text=vengo%20desde%20la%20web" target="_blank" className="btn-reserva" style={{ display: 'inline-flex', width: 'auto', margin: '0 auto', fontSize: '1.2rem', padding: '1.5rem 3rem' }}>
            <i className="fab fa-whatsapp"></i>
            <span className="btn-text">Agendar por WhatsApp</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col"><h3>Era Nails &amp; Hair</h3><p>Centro especializado en plástica de pies brasileña y servicios estéticos premium</p></div>
          <div className="footer-col"><h3>Ubicación</h3><p>Fernando de la Mora, Asunción, Paraguay</p><p>A 1/2 cuadra del Real Sur</p></div>
          <div className="footer-col">
            <h3>Contacto</h3>
            <p><a href="https://wa.me/595984704144" target="_blank">WhatsApp: +595 984 704144</a></p>
            <p>Instagram: <a href="https://www.instagram.com/eranailshomespa/" target="_blank">@eranailshomespa</a></p>
          </div>
          <div className="footer-col"><h3>Servicios</h3><p>Polygel • Acrílicas • Gel</p><p>Quiropodia • Podología</p><p>Plástica de Pies Brasileña</p></div>
        </div>
        <div className="footer-divider"></div>
        <p className="footer-credit">Servicios de belleza integral con estándares internacionales | © 2026 &mdash; Powered by <a href="https://www.josevec.uk/" target="_blank" rel="noopener noreferrer" className="footer-powered-link">Bezaleel Automation</a> &mdash; <a href="/admin" className="footer-powered-link">Panel Admin</a></p>
      </footer>

      <a href="https://wa.me/595984704144?text=vengo%20desde%20la%20web" target="_blank" className="floating-action">
        <i className="fab fa-whatsapp"></i>
      </a>
    </>
  )
}
