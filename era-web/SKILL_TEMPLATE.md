# Skill: Crear Página Web Animada para Negocio de Servicios

## 📋 Descripción
Skill automatizado para generar una página web completamente animada para negocios de servicios estéticos, salones, etc. Incluye todas las secciones, efectos de scroll, animaciones de texto y botón de WhatsApp integrado.

## 🎯 Propósito
Reutilizar el proceso de creación de una landing page moderna y profesional con animaciones avanzadas para distintos tipos de negocios.

## 📦 Estructura de Archivos Generados

```
proyecto/
├── index.html          # HTML semántico con estructura completa
├── styles.css          # Estilos responsivos con animaciones CSS
├── script.js           # JavaScript para interactividad y scroll animations
└── README.md           # Documentación del proyecto
```

## 🔧 Requisitos de Entrada

El usuario debe proporcionar:

1. **Información del Negocio**
   - Nombre del negocio
   - Ubicación/Dirección
   - Número de WhatsApp (formato: +código_país número)
   - Descripción/Tagline

2. **Servicios**
   - Lista de servicios con nombres
   - Precios en moneda local
   - Descripciones breves

3. **Testimonios (Opcional)**
   - Reseñas de clientes
   - Nombres

4. **Colores/Marca (Opcional)**
   - Colores primarios
   - Estilos preferidos

## 🎨 Características Incluidas

### Animaciones CSS
- ✨ Animación de palabras deslizantes (Hero)
- 🔄 Rotaciones y pulsaciones de iconos
- 📊 Aparición en cascada de tarjetas (stagger)
- 🌊 Parallax en fondo
- 💫 Efectos hover avanzados
- 🎯 Animaciones de scroll

### JavaScript
- 🖱️ Smooth scroll a secciones
- 📍 Active nav link según scroll position
- 👁️ Intersection Observer para animaciones de scroll
- 🎬 Parallax dinámico
- 📱 Responsive en móvil
- ♿ Accesibilidad mejorada

### Componentes
- 📍 Navbar sticky con animaciones
- 🎯 Hero section con texto animado
- 💼 Grid de servicios con precios
- ⭐ Sección de testimonios
- 📲 CTA con WhatsApp
- 🔗 Footer informativo
- 💬 Botón flotante de WhatsApp

## 📝 Proceso de Creación

### Paso 1: Recopilación de Datos
- Solicitar información del negocio al usuario
- Obtener lista de servicios y precios
- Recopilar testimonios/reseñas

### Paso 2: Estructura HTML
- Crear estructura semántica
- Incluir todas las secciones necesarias
- Agregar links de WhatsApp correctamente formateados
- Usar Font Awesome para iconos

### Paso 3: Estilos CSS
- Definir variables CSS para colores
- Crear animaciones reutilizables
- Implementar responsive design
- Agregar efectos hover e interactivos

### Paso 4: Interactividad JavaScript
- Smooth scrolling
- Animaciones de scroll (Intersection Observer)
- Navbar inteligente
- Efectos de parallax

### Paso 5: Optimización
- Verificar responsiveness en móvil
- Optimizar animaciones para rendimiento
- Verificar compatibilidad navegadores
- Minificar CSS/JS (opcional)

## 🚀 Link de WhatsApp Correcto

El formato correcto es:
```html
<a href="https://wa.me/[código_país][número]" target="_blank">
  Agendar
</a>
```

Ejemplo para Paraguay:
```html
<a href="https://wa.me/595984704144" target="_blank">
  Agendar
</a>
```

**Importante:** Usar `https://wa.me/` (no `wa.me/` sin protocolo)

## 🎬 Animaciones Clave

### Fade In Up
```css
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### Stagger Effect
```css
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
```

### Parallax
```javascript
window.addEventListener('scroll', () => {
    element.style.transform = `translateY(${scrollPosition * 0.5}px)`;
});
```

## 📱 Responsive Breakpoints

- **Desktop:** 1200px+
- **Tablet:** 768px - 1199px
- **Mobile:** < 768px

## ⚡ Performance Tips

1. Usar `will-change` con moderación
2. Preferir `transform` y `opacity` para animaciones
3. Usar `requestAnimationFrame` en lugar de timeouts
4. Implementar `Intersection Observer` para lazy animations
5. Minificar CSS/JS en producción

## 🔄 Customización

Para adaptarlo a otro negocio, cambiar:

1. **Colores:** Actualizar variables CSS en `:root`
2. **Servicios:** Agregar/quitar tarjetas en HTML
3. **Contenido:** Reemplazar textos, nombres, descripciones
4. **Iconos:** Cambiar emoji o usar Font Awesome
5. **Número WhatsApp:** Actualizar en todos los links

## 📊 Checkklist de Implementación

- [ ] Recopilar información del negocio
- [ ] Crear estructura HTML base
- [ ] Implementar estilos CSS
- [ ] Agregar animaciones avanzadas
- [ ] Implementar interactividad JavaScript
- [ ] Verificar en móvil
- [ ] Probar todos los links
- [ ] Optimizar rendimiento
- [ ] Verificar accesibilidad

## 🎓 Ejemplos de Uso

### Para Salón de Belleza
- Servicios: cortes, coloración, alisados
- Énfasis en galería de trabajos
- Reseñas de clientes

### Para Clínica/Spa
- Servicios: masajes, tratamientos
- Énfasis en ambiente relajante
- Horarios disponibles

### Para Taller Mecánico
- Servicios: mantenimiento, reparaciones
- Énfasis en experiencia
- Garantía de servicios

## 📞 Soporte

Si necesitas adaptar este template a otro negocio:
1. Sigue el mismo flujo de estructura
2. Customiza colores y contenido
3. Reutiliza componentes CSS/JS
4. Verifica responsiveness

---

**Versión:** 1.0  
**Última actualización:** 2026-04-12  
**Autor:** Claude Code