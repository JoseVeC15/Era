export default function HeroSection() {
  return (
    <>
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
    </>
  )
}
