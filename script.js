// ============ LENIS SMOOTH SCROLL ============
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ============ SCROLL ANIMATIONS ============
gsap.registerPlugin(ScrollTrigger);

// Animate section titles
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
});

// Animate service cards
gsap.utils.toArray('.service-item').forEach((item, index) => {
    gsap.from(item, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: index * 0.1,
        scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });
});

// ============ SMOOTH SCROLL TO SECTIONS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            lenis.scrollTo(target);
        }
    });
});

// ============ ENTRY ANIMATIONS ============
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    // Initial state
    gsap.set('.btn-capsule, .btn-reserva', { opacity: 0, y: 20 });
    gsap.set('.hero-pionera-bg', { opacity: 0, scale: 1.1 });
    gsap.set('.hero-bottom-content', { opacity: 0, y: 30 });

    tl.to('.hero-pionera-bg', { opacity: 0.05, scale: 1, duration: 1.5, ease: 'power3.out' })
      .to('.btn-capsule, .btn-reserva', { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: 'back.out(1.7)' 
      }, '-=0.5')
      .to('.hero-bottom-content', { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power2.out' 
      }, '-=0.3');
});

// ============ ACTIVE NAV LINK ============
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.btn-capsule');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// ============ CONSOLE MESSAGE ============
console.log('%c✨ Era Nails & Hair - Premium Glow Experience', 'color: #B76E79; font-size: 20px; font-weight: bold;');
console.log('%cTécnica Original Brasileña de Plástica de Pies', 'color: #D4AF37; font-size: 14px;');
x;');