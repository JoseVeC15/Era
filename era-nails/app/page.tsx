import ThreeScripts from '@/components/ThreeScripts'
import ReservasSection from '@/components/ReservasSection'

export default function Home() {
  return (
    <>
      <canvas id="generative-bg"></canvas>

      <nav className="navbar">
        <a href="#inicio" className="logo">
          <img src="/logo.jpg" alt="Era Nails Logo" className="logo-img" />
          <span className="logo-text" style={{ color: 'var(--quartz)', fontFamily: "'Cormorant Garamond', serif" }}>
            Era Nails &amp; Hair
          </span>
        </a>
      </nav>

      <section id="inicio" className="hero">
        <div className="hero-pionera-bg">Era Nails &amp; Hair</div>
        <div className="header-ui">
          <div className="nav-capsules">
            <a href="#servicios" className="btn-capsule">Servicios</a>
            <a href="#cursos" className="btn-capsule">Cursos</a>
            <a href="#reservas" className="btn-capsule">Turnos</a>
            <a href="#nosotras" className="btn-capsule">Nosotras</a>
          </div>
          <a href="https://wa.me/595984704144?text=vengo%20desde%20la%20web" target="_blank" className="btn-reserva">
            RESERVA CITA <i className="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>
        <div className="hero-container">
          <div className="hero-bottom-content">
            <h2 className="hero-tagline">La excelencia en el cuidado de tus manos y pies.</h2>
            <p className="hero-subtitle">PIONERA EN PLÁSTICA DE PIES - ORIGEN BRASILEÑO</p>
          </div>
        </div>
        <canvas id="three-canvas" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}></canvas>
      </section>

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

      <section className="spa-space">
        <div className="section-header">
          <h2 className="section-title">Nuestro Espacio Spa</h2>
          <div className="title-underline"></div>
        </div>
        <div className="spa-content">
          <div className="spa-card feature-card"><div className="feature-icon spa-emoji">🧖‍♀️</div><h3>Espacio de Spa Especializado</h3><p>Ambiente climatizado diseñado para máximo confort y bienestar.</p></div>
          <div className="spa-card feature-card"><div className="feature-icon spa-emoji">✅</div><h3>Certificación de Bioseguridad</h3><p>Protocolos sanitarios internacionales, materiales estériles y desinfección continua.</p></div>
          <div className="spa-card feature-card"><div className="feature-icon spa-emoji">👑</div><h3>Servicio Premium</h3><p>Atención personalizada con estándares de elegancia internacional.</p></div>
          <div className="spa-card feature-card"><div className="feature-icon spa-emoji">💝</div><h3>Atención Diferenciada</h3><p>Tratamiento personalizado para cada cliente.</p></div>
        </div>
      </section>

      {/* ── GESTIÓN & AGENDA INTELIGENTE ── */}
      <section className="gestion-section">
        <div className="section-header">
          <h2 className="section-title">Gestión &amp; Agenda Inteligente</h2>
          <p className="section-tagline">Tecnología avanzada al servicio de tu experiencia</p>
          <div className="title-underline"></div>
        </div>
        <div className="gestion-grid">
          {[
            { icon: '🕐', title: 'Reservas 24/7', desc: 'Agendá tu turno en cualquier momento desde el catálogo, sin necesidad de llamar o esperar respuesta.' },
            { icon: '📅', title: 'Sincronización con Google Calendar', desc: 'Conexión bidireccional que evita solapamientos y mantiene la agenda siempre actualizada en tiempo real.' },
            { icon: '👥', title: 'Gestión de Equipos', desc: 'Administración de agendas de múltiples profesionales bajo una misma marca, de forma centralizada.' },
            { icon: '📋', title: 'Ficha de Clientes (CRM)', desc: 'Historial detallado de cada clienta, preferencias, servicios anteriores y notas de seguimiento personalizadas.' },
            { icon: '💳', title: 'Pasarelas de Pago', desc: 'Integración con los sistemas de pago locales de Paraguay para confirmar reservas de forma segura y rápida.' },
            { icon: '💰', title: 'Sistema de Señas', desc: 'Cobrá un adelanto automático para confirmar la reserva y reducir significativamente el ausentismo.' },
            { icon: '🌍', title: 'Múltiples Monedas', desc: 'Plataforma adaptable a diferentes mercados y monedas, lista para escalar a cualquier región.' },
          ].map((item, i) => (
            <div key={i} className="gestion-card">
              <div className="gestion-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN DE TURNOS ── */}
      <ReservasSection />

      <section id="nosotras" className="emprendedor-story">
        <div className="story-content">
          <h2 className="story-title">Nuestra Misión</h2>
          <p className="story-text">En Era Nails &amp; Hair, no solo vemos rostros o manos; vemos historias, metas y personalidades únicas. Construimos este espacio con una meta clara: que al cruzar nuestra puerta, sientas que este es tu refugio.</p>
          <p className="story-subtitle">Más que un servicio de excelencia, lo que nos mueve es la ilusión de verte salir con esa chispa de confianza renovada.</p>
        </div>
      </section>

      <section id="testimonios" className="testimonios">
        <div className="section-header">
          <h2 className="section-title">Lo Que Dicen Nuestras Clientes</h2>
          <div className="title-underline"></div>
        </div>
        <div className="testimonios-grid">
          {[
            { text: '"Excelente servicio en manos y pies. El ambiente y atención profesional hacen que te sientas especial."', author: 'Ivanna Ayelén Román' },
            { text: '"Trabajos impecables con atención personalizada. Siempre logran resultados excepcionales."', author: 'Ana Bogado' },
            { text: '"Profesionalismo de alta calidad. Después de conocerlos, son mi opción principal."', author: 'Lucero Resquin' },
            { text: '"Servicio integral que te hace sentir empoderada. La dedicación al detalle los diferencia."', author: 'Ana Bernal' },
            { text: '"Ambiente acogedor con profesionales altamente capacitados."', author: 'Rossana Duarte' },
            { text: '"Recomendado ampliamente. Servicios premium con atención excepcional."', author: 'Clientes Satisfechos' },
          ].map((t, i) => (
            <div key={i} className="testimonio-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonio-text">{t.text}</p>
              <p className="testimonio-author">{t.author}</p>
            </div>
          ))}
        </div>
      </section>

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

      <ThreeScripts />
    </>
  )
}
