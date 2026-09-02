/* ============================================================
   CHACOQUIRA — SCROLL (GSAP + ScrollTrigger)
   Reveals, parallax, carrusel horizontal de celebraciones.
   Con red de seguridad: si GSAP no arranca, nada queda oculto.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hayGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!hayGSAP || reducido) {
    // sin animaciones: todo visible de inmediato
    document.documentElement.classList.add('sin-anim');
    activarVideosCelebraciones();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const DATOS = window.CHACO_DATOS;

  /* ---------- red de seguridad anti-contenido-oculto ---------- */
  setTimeout(() => {
    $$('.rev').forEach((el) => {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.05 && ScrollTrigger.isInViewport(el, 0.9)) {
        gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' });
      }
    });
  }, 2600);

  /* ---------- reveals genéricos ---------- */
  $$('.rev').forEach((el) => {
    gsap.fromTo(el,
      { y: 34, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        clearProps: 'transform'
      });
  });

  /* ---------- palabras en cascada ---------- */
  $$('.palabras').forEach((el) => {
    gsap.fromTo($$('.rev-palabra', el),
      { y: '0.7em', opacity: 0, rotate: 2 },
      {
        y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.055,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        clearProps: 'transform'
      });
  });

  /* ---------- hero: parallax de salida ---------- */
  const heroContenido = $('#hero-contenido');
  if (heroContenido) {
    gsap.to(heroContenido, {
      yPercent: -16, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom 30%', scrub: 0.5 }
    });
    const logo = $('#hero-logo');
    if (logo) {
      gsap.fromTo(logo, { scale: 0.92, y: 26, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 1.6, ease: 'power3.out', delay: 0.15, clearProps: 'transform' });
    }
    const eslogan = $('#hero-eslogan');
    if (eslogan) {
      gsap.fromTo(eslogan, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.55, clearProps: 'transform' });
    }
    const chips = $('#hero-chips');
    if (chips) {
      gsap.fromTo(chips.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.09, delay: 0.75, clearProps: 'transform' });
    }
    const ctas = $('#hero-ctas');
    if (ctas) {
      gsap.fromTo(ctas.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.09, delay: 0.9, clearProps: 'transform' });
    }
  }

  /* ---------- flotantes del concepto ---------- */
  $$('[data-flotar]').forEach((el) => {
    const v = parseFloat(el.getAttribute('data-flotar')) || 10;
    gsap.to(el, {
      yPercent: -v, ease: 'none',
      scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 0.7 }
    });
  });

  /* ---------- carrusel horizontal de celebraciones (escritorio) ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 761px)', () => {
    const seccion = $('#celebraciones');
    const pista = $('#celebra-pista');
    const pin = $('#celebra-pin');
    if (!seccion || !pista || !pin) return;

    const paneles = $$('.celebra-panel', pista);
    const total = () => Math.max(0, pista.scrollWidth - window.innerWidth);

    const avanceRiel = $('.celebra-avance .llenado');
    const avanceRotulo = $('.celebra-avance .rotulo');

    const tween = gsap.to(pista, {
      x: () => -total(),
      ease: 'none',
      scrollTrigger: {
        trigger: seccion,
        start: 'top top',
        end: () => '+=' + (total() + window.innerHeight * 0.15),
        pin: pin,
        scrub: 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: 1 / (paneles.length - 1),
          duration: { min: 0.25, max: 0.7 },
          delay: 0.08,
          ease: 'power2.inOut'
        },
        onUpdate: (self) => {
          const idx = Math.min(paneles.length - 1, Math.round(self.progress * (paneles.length - 1)));
          const panel = paneles[idx];
          const color = panel && panel.style.getPropertyValue('--panel-color');
          if (color) seccion.style.setProperty('--panel-color', color);
          if (avanceRiel) avanceRiel.style.width = (self.progress * 100).toFixed(1) + '%';
          if (avanceRotulo) avanceRotulo.textContent = '0' + Math.min(7, idx) + ' / 07';
        }
      }
    });

    return () => {
      seccion.style.removeProperty('--panel-color');
    };
  });

  /* ---------- refrescos ---------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  document.addEventListener('chaco:preloader-fuera', () => ScrollTrigger.refresh());

  /* ---------- videos de celebraciones: activar al verse ---------- */
  function activarVideosCelebraciones() {
    const medias = $$('.celebra-media[data-video]');
    if (!medias.length) return;

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        const caja = en.target;
        const v = $('video', caja);
        if (!v) return;
        if (en.intersectionRatio >= 0.4) {
          caja.classList.add('pronta');
          const prom = v.play();
          if (prom && prom.catch) prom.catch(() => {});
        } else {
          if (!v.paused) v.pause();
        }
      });
    }, { threshold: [0, 0.4, 0.75] });

    medias.forEach((caja) => {
      // el video se crea perezosamente la primera vez que se acerca
      const obsCarga = new IntersectionObserver((en2) => {
        if (!en2[0].isIntersecting) return;
        obsCarga.disconnect();
        if ($('video', caja)) return;
        const v = document.createElement('video');
        v.src = caja.getAttribute('data-video');
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = 'none';
        v.setAttribute('playsinline', '');
        v.setAttribute('aria-hidden', 'true');
        v.addEventListener('canplay', () => caja.classList.add('pronta'), { once: true });
        caja.appendChild(v);
        obs.observe(caja);
      }, { rootMargin: '500px 0px' });
      obsCarga.observe(caja);
    });
  }
  activarVideosCelebraciones();
})();
