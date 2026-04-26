export default function GaleriaSection() {
  return (
    <section id="galeria" className="galeria instagram-section">
      <div className="section-header">
        <h2 className="section-title">Galería de Trabajos</h2>
        <p className="section-tagline">Sigue nuestro trabajo en Instagram @eranailshomespa</p>
        <div className="title-underline"></div>
      </div>
      <div className="instagram-feed-container">
        <div className="elfsight-app-f9944e0d-1316-4134-887f-ffd672230c02" data-elfsight-app-lazy></div>
        <div className="instagram-direct-link">
          <p style={{ color: 'var(--quartz)', opacity: 0.8, marginBottom: '1.5rem' }}>Visita nuestro Instagram para ver más trabajos</p>
          <a href="https://www.instagram.com/eranailshomespa/" target="_blank" rel="noopener noreferrer" className="btn-reserva" style={{ display: 'inline-flex', width: 'auto', margin: '0 auto' }}>
            <span className="btn-text">Ver Instagram @eranailshomespa</span>
          </a>
        </div>
      </div>
    </section>
  )
}
