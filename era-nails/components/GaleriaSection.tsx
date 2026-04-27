'use client'
import { useEffect, useState } from 'react'

interface GalleryItem {
  id: string
  image_url: string
  title: string | null
  category: string | null
}

export default function GaleriaSection() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  if (loaded && items.length === 0) {
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

  return (
    <section id="galeria" className="galeria instagram-section">
      <div className="section-header">
        <h2 className="section-title">Galería de Trabajos</h2>
        <p className="section-tagline">Algunos de nuestros trabajos más recientes</p>
        <div className="title-underline"></div>
      </div>

      {!loaded && (
        <p style={{ textAlign: 'center', color: 'var(--quartz)', opacity: 0.5 }}>Cargando galería...</p>
      )}

      {loaded && items.length > 0 && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1rem',
          }}>
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setLightbox(item)}
                style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', position: 'relative', background: 'rgba(255,255,255,0.04)' }}
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? 'Galería Era Nails'}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {item.category && (
                  <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.55)', borderRadius: '4px', padding: '2px 7px', fontSize: '0.72rem', color: 'rgba(245,210,230,0.9)' }}>
                    {item.category}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="instagram-direct-link" style={{ marginTop: '2rem' }}>
            <a href="https://www.instagram.com/eranailshomespa/" target="_blank" rel="noopener noreferrer" className="btn-reserva" style={{ display: 'inline-flex', width: 'auto', margin: '0 auto' }}>
              <span className="btn-text">Ver más en Instagram @eranailshomespa</span>
            </a>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
            <img src={lightbox.image_url} alt={lightbox.title ?? ''} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '10px', objectFit: 'contain', display: 'block' }} />
            {lightbox.title && (
              <p style={{ textAlign: 'center', color: 'rgba(245,210,230,0.8)', marginTop: '0.75rem', fontSize: '0.95rem' }}>{lightbox.title}</p>
            )}
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
