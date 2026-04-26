# Configuración del Feed de Instagram

## 📸 Galería Instagram Integrada

La sección de "Transformaciones" ha sido reemplazada por una galería de Instagram en vivo que muestra directamente tus posts de @eranailshomespa.

## 🔧 Opciones de Configuración

### OPCIÓN 1: Elfsight (RECOMENDADA - Gratuita)

**Pasos:**

1. Ir a https://elfsight.com/es/
2. Crear cuenta gratuita (email o Google)
3. Buscar "Instagram Feed" en el marketplace
4. Crear un nuevo widget de Instagram Feed
5. Conectar tu cuenta de Instagram @eranailshomespa
6. Copiar el **App ID** que genera
7. Reemplazar en `index.html`:

```html
<div class="elfsight-app" data-elfsight-app-lazy></div>
```

Por:

```html
<div class="elfsight-app" data-elfsight-app-lazy data-elfsight-app-id="YOUR_APP_ID"></div>
```

**Ventajas:**
- ✅ Totalmente gratuito
- ✅ Feed en tiempo real
- ✅ Responsive automático
- ✅ Sin código de más
- ✅ Fácil de configurar
- ✅ Muchas opciones de personalización

**Desventajas:**
- Depende de Elfsight (servicio externo)
- Requiere conexión a internet

---

### OPCIÓN 2: Instagram Basic Display API (Para Desarrolladores)

Si prefieres algo más personalizado sin dependencias externas.

**Requisitos:**
- Tener App de Facebook desarrollador
- Configurar Instagram Basic Display API
- Código JavaScript custom

**Ventajas:**
- ✅ Control total
- ✅ Sin servicios externos
- ✅ Personalizable al 100%

**Desventajas:**
- ❌ Más complejo de configurar
- ❌ Requiere conocimiento técnico
- ❌ Necesita renovación de tokens

---

### OPCIÓN 3: Plugin / Widget Alternativo

Otras opciones gratuitas:
- **Taggbox** (https://taggbox.com/)
- **Instashow** (https://www.instashow.io/)
- **Snapwidget** (https://snapwidget.com/)
- **Onstipe** (https://www.onstipe.com/)

---

## 📱 Código HTML Actual

```html
<!-- Galería Instagram -->
<section id="galeria" class="galeria instagram-section">
    <div class="section-header">
        <h2 class="section-title">Galería de Trabajos</h2>
        <p class="section-tagline">Sigue nuestro trabajo en Instagram @eranailshomespa</p>
        <div class="title-underline"></div>
    </div>

    <div class="instagram-feed-container">
        <!-- Embed de Instagram Feed Widget -->
        <div class="elfsight-app" data-elfsight-app-lazy></div>

        <!-- Enlace directo a Instagram como alternativa -->
        <div class="instagram-direct-link">
            <p>Visita nuestro Instagram para ver más trabajos y actualizaciones diarias</p>
            <a href="https://www.instagram.com/eranailshomespa/" target="_blank" class="magnetic-btn btn-secondary">
                <span class="btn-text">Ver Instagram @eranailshomespa</span>
                <span class="btn-icon">📸</span>
            </a>
        </div>
    </div>
</section>
```

---

## 🎨 Estilos CSS Incluidos

```css
.instagram-section {
    background: linear-gradient(180deg, #FFF0F5 0%, #FFFFFF 100%);
}

.instagram-feed-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.elfsight-app {
    width: 100%;
    min-height: 600px;
    animation: fadeInUp 0.8s ease-out;
}

.instagram-direct-link {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 20px;
    border: 2px solid rgba(255, 20, 147, 0.2);
    box-shadow: 0 5px 20px rgba(255, 20, 147, 0.1);
}
```

---

## ✅ Características Implementadas

✅ Sección responsive
✅ Colores coherentes (blanco/rosado)
✅ Animaciones suaves
✅ Botón de enlace directo a Instagram
✅ Compatible con múltiples dispositivos
✅ Fallback si el widget no carga

---

## 🚀 Próximos Pasos

### Rápido (5 minutos):
1. Ir a https://elfsight.com/es/
2. Crear widget de Instagram Feed
3. Copiar App ID
4. Actualizar el valor en `index.html`

### Alternativa (si no quieres usar Elfsight):
- El botón "Ver Instagram @eranailshomespa" sigue funcionando
- Lleva directamente a tu perfil
- Los usuarios pueden ver todo tu contenido

---

## 📊 Comparación de Opciones

| Opción | Setup | Costo | Personalización | Mantenimiento |
|--------|-------|-------|-----------------|--------------|
| **Elfsight** | ⭐⭐ Fácil | Gratis | ⭐⭐⭐ Alta | ⭐⭐ Bajo |
| **API Instagram** | ⭐⭐⭐⭐ Difícil | Gratis | ⭐⭐⭐⭐⭐ Máxima | ⭐⭐⭐ Alto |
| **Otros Widgets** | ⭐⭐ Fácil | Gratis | ⭐⭐⭐ Media | ⭐⭐ Bajo |

---

## 💡 Recomendación

**Usa Elfsight** porque:
- ✅ Es el más fácil de configurar
- ✅ Totalmente gratuito
- ✅ Mantiene el feed siempre actualizado
- ✅ Función automáticamente
- ✅ Compatible con cualquier tema
- ✅ Excelente soporte

---

## 🔗 Recursos Útiles

- Elfsight: https://elfsight.com/es/
- Instagram Business: https://business.instagram.com/
- Documentación: https://developers.facebook.com/docs/instagram-basic-display-api

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el App ID sea correcto
2. Asegúrate de que la cuenta de Instagram sea pública
3. Recarga la página (Ctrl+F5)
4. Consulta la documentación de Elfsight

---

**Nota:** El widget de Elfsight se cargará automáticamente cuando la página se abra. Los posts de Instagram aparecerán en cuadrícula responsiva.
