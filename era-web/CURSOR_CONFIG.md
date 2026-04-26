# Configuración del Cursor

## Estado Actual

✅ **Cursor Normal del Navegador** (Visible)

El cursor personalizado ha sido desactivado. Ahora puedes ver el cursor estándar del navegador.

---

## 🔄 Como Cambiar de Cursor

### Si Quieres Mostrar el Cursor Normal (ACTUAL)

Ya está configurado. El cursor normal es visible.

---

### Si Quieres Reactivar el Cursor Personalizado

Haz cambios en estos 2 archivos:

#### 1. En `styles.css`

**Busca:**
```css
.cursor {
    ...
    display: none;
}

.cursor-follower {
    ...
    display: none;
}
```

**Reemplaza `display: none;` por `display: block;`:**
```css
.cursor {
    ...
    display: block;
}

.cursor-follower {
    ...
    display: block;
}
```

**Y cambia en body:**
```css
body {
    cursor: none;  /* Fue cursor: auto; */
}
```

#### 2. En `script.js`

**Busca la sección que dice:**
```javascript
// ============ CURSOR PERSONALIZADO (DESACTIVADO) ============
```

**Reemplaza por el código original:**
```javascript
// ============ CURSOR PERSONALIZADO ============
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.to(cursor, {
        x: mouseX - 5,
        y: mouseY - 5,
        duration: 0.1
    });

    gsap.to(cursorFollower, {
        x: mouseX - 15,
        y: mouseY - 15,
        duration: 0.3
    });
});

const hoverElements = document.querySelectorAll('a, button, .magnetic-btn, .service-card');

hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.opacity = '0.5';
        cursorFollower.style.borderColor = getComputedStyle(el).color || 'var(--primary)';
        gsap.to(cursorFollower, {
            scale: 1.5,
            duration: 0.3
        });
    });

    el.addEventListener('mouseleave', () => {
        cursor.style.opacity = '1';
        cursorFollower.style.borderColor = 'var(--primary)';
        gsap.to(cursorFollower, {
            scale: 1,
            duration: 0.3
        });
    });
});
```

**Y reactiva la sección de mouse leave:**
```javascript
document.addEventListener('mouseleave', () => {
    gsap.to([cursor, cursorFollower], {
        opacity: 0,
        duration: 0.3
    });
});

document.addEventListener('mouseenter', () => {
    gsap.to([cursor, cursorFollower], {
        opacity: 1,
        duration: 0.3
    });
});
```

---

## 📊 Comparación

### Cursor Normal
- ✅ Visible y familiar
- ✅ Compatible con cualquier navegador
- ✅ No requiere JavaScript
- ❌ Menos personalizado

### Cursor Personalizado
- ✅ Único y premium
- ✅ Animaciones fluidas
- ✅ Sigue el mouse elegantemente
- ✅ Cambia en hover
- ❌ Requiere JavaScript
- ❌ Puede tener lag en PCs lentas

---

## 💡 Recomendación

**Cursor Normal:** Mejor para rendimiento y compatibilidad
**Cursor Personalizado:** Mejor para impacto visual y premium

El cursor actual es el normal del navegador, que es perfecto para la mayoría de usuarios.

---

## 📞 Soporte

Si necesitas cambiar entre uno u otro, solo sigue los pasos arriba.
Cualquier pregunta, consulta la sección específica.
