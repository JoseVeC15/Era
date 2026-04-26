import HeroSection from '@/components/HeroSection'
import ServiciosSection from '@/components/ServiciosSection'
import CursosSection from '@/components/CursosSection'
import SpaSection from '@/components/SpaSection'
import GestionSection from '@/components/GestionSection'
import ReservasSection from '@/components/ReservasSection'
import TestimoniosSection from '@/components/TestimoniosSection'
import GaleriaSection from '@/components/GaleriaSection'
import SiteFooter from '@/components/SiteFooter'
import ThreeScripts from '@/components/ThreeScripts'

export default function Home() {
  return (
    <>
      <canvas id="generative-bg"></canvas>
      <HeroSection />
      <ServiciosSection />
      <CursosSection />
      <SpaSection />
      <GestionSection />
      <section id="nosotras" className="emprendedor-story">
        <div className="story-content">
          <h2 className="story-title">Nuestra Misión</h2>
          <p className="story-text">En Era Nails &amp; Hair, no solo vemos rostros o manos; vemos historias, metas y personalidades únicas. Construimos este espacio con una meta clara: que al cruzar nuestra puerta, sientas que este es tu refugio.</p>
          <p className="story-subtitle">Más que un servicio de excelencia, lo que nos mueve es la ilusión de verte salir con esa chispa de confianza renovada.</p>
        </div>
      </section>
      <ReservasSection />
      <TestimoniosSection />
      <GaleriaSection />
      <SiteFooter />
      <ThreeScripts />
    </>
  )
}
