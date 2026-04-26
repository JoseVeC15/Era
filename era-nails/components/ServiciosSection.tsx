export default function ServiciosSection() {
  return (
    <section id="servicios" className="servicios">
      <div className="section-header">
        <h2 className="section-title">Servicios Especializados</h2>
        <p className="section-tagline">Brindamos servicios de belleza y cuidado integral con estándares de calidad internacional</p>
        <div className="title-underline"></div>
      </div>
      <div className="servicios-grid">
        <div className="service-item" data-service="plastica">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">💎</span><h3>Plástica de Pies Brasileña</h3></div>
            <p className="service-desc">Técnica especializada de origen brasileño que combina estética y cuidado integral de pies. Incluye quiropodia profesional y tratamiento podológico.</p>
            <ul className="price-detail">
              <li><span>Plástica Básica</span><span className="price">₲ 80.000</span></li>
              <li><span>Con Diseño Tradicional</span><span className="price">₲ 100.000</span></li>
              <li><span>Con Semi Gel</span><span className="price">₲ 150.000</span></li>
              <li><span>Con Semi French</span><span className="price">₲ 160.000</span></li>
              <li><span>Apliques Decorativos</span><span className="price">desde ₲ 15.000</span></li>
            </ul>
          </div>
        </div>
        <div className="service-item" data-service="acrilicas">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">✨</span><h3>Uñas Acrílicas</h3></div>
            <p className="service-desc">Diseños personalizados con acabado impecable y durabilidad extendida.</p>
            <ul className="price-detail">
              <li><span>Nude Clásicas Cortas</span><span className="price">₲ 145.000</span></li>
              <li><span>Nude Clásicas Largas</span><span className="price">₲ 160.000</span></li>
              <li><span>Vía Láctea Cortas</span><span className="price">₲ 160.000</span></li>
              <li><span>Vía Láctea Largas</span><span className="price">₲ 180.000</span></li>
              <li><span>Kapping en Uña Natural</span><span className="price">₲ 130.000</span></li>
              <li><span>Esmaltado Complementario</span><span className="price">₲ 70.000</span></li>
            </ul>
          </div>
        </div>
        <div className="service-item" data-service="gel">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">💅</span><h3>Gel &amp; Polygel</h3></div>
            <p className="service-desc">Sistemas de uñas con acabado brillante y durabilidad superior.</p>
            <ul className="price-detail">
              <li><span>Gel Esculpido Cortas</span><span className="price">₲ 160.000</span></li>
              <li><span>Gel Esculpido Largas</span><span className="price">₲ 180.000</span></li>
              <li><span>Kapping Gel</span><span className="price">₲ 155.000</span></li>
              <li><span>Nivelación Rubber Gel</span><span className="price">₲ 100.000</span></li>
              <li><span>Esmaltado Gel Complementario</span><span className="price">₲ 70.000</span></li>
            </ul>
          </div>
        </div>
        <div className="service-item" data-service="extras">
          <div className="service-card">
            <div className="card-header"><span className="service-emoji">🎨</span><h3>Servicios Adicionales</h3></div>
            <p className="service-desc">Servicios complementarios de personalización y mantenimiento.</p>
            <ul className="price-detail">
              <li><span>Encapsulado de Brillo - Par</span><span className="price">₲ 20.000</span></li>
              <li><span>Diseños Personalizados</span><span className="price">desde ₲ 20.000</span></li>
              <li><span>Extracción Profesional</span><span className="price">₲ 50.000</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
