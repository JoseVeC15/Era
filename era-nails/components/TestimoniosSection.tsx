const testimonios = [
  { text: '"Excelente servicio en manos y pies. El ambiente y atención profesional hacen que te sientas especial."', author: 'Ivanna Ayelén Román' },
  { text: '"Trabajos impecables con atención personalizada. Siempre logran resultados excepcionales."', author: 'Ana Bogado' },
  { text: '"Profesionalismo de alta calidad. Después de conocerlos, son mi opción principal."', author: 'Lucero Resquin' },
  { text: '"Servicio integral que te hace sentir empoderada. La dedicación al detalle los diferencia."', author: 'Ana Bernal' },
  { text: '"Ambiente acogedor con profesionales altamente capacitados."', author: 'Rossana Duarte' },
  { text: '"Recomendado ampliamente. Servicios premium con atención excepcional."', author: 'Clientes Satisfechos' },
]

export default function TestimoniosSection() {
  return (
    <section id="testimonios" className="testimonios">
      <div className="section-header">
        <h2 className="section-title">Lo Que Dicen Nuestras Clientes</h2>
        <div className="title-underline"></div>
      </div>
      <div className="testimonios-grid">
        {testimonios.map((t, i) => (
          <div key={i} className="testimonio-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonio-text">{t.text}</p>
            <p className="testimonio-author">{t.author}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
