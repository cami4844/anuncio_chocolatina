/* ============================================================
   CHACOQUIRA — ESCENAS ELIMINADAS
   Comparadores antes/después (arrastre + teclado),
   reproducción de tomas reales y lightbox de imágenes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ================= COMPARADORES ================= */
  $$('.comparador-escena').forEach((escena) => {
    const despues = $('.img-despues', escena);
    const mango = $('.comparador-mango', escena);
    let corte = 50;

    function aplica() {
      escena.style.setProperty('--corte', corte + '%');
      mango.style.left = corte + '%';
      escena.setAttribute('aria-valuenow', Math.round(corte));
    }
    function desdeX(clientX) {
      const r = escena.getBoundingClientRect();
      corte = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
      aplica();
    }
    let activo = false;
    escena.addEventListener('pointerdown', (e) => {
      activo = true;
      escena.setPointerCapture && escena.setPointerCapture(e.pointerId);
      desdeX(e.clientX);
    });
    escena.addEventListener('pointermove', (e) => { if (activo) desdeX(e.clientX); });
    escena.addEventListener('pointerup', () => { activo = false; });
    escena.addEventListener('pointercancel', () => { activo = false; });
    escena.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { corte = Math.max(0, corte - 4); aplica(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { corte = Math.min(100, corte + 4); aplica(); e.preventDefault(); }
      if (e.key === 'Home') { corte = 0; aplica(); }
      if (e.key === 'End') { corte = 100; aplica(); }
    });
    aplica();
  });

  /* ================= MOSAICO DE TOMAS → LIGHTBOX ================= */
  $$('.mosaico-item').forEach((fig) => {
    const img = $('img', fig);
    const pie = $('.mosaico-pie .t', fig);
    const titulo = pie ? pie.textContent : 'Toma real';
    fig.addEventListener('click', () => abreLightbox(img.src, titulo, false));
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Ampliar: ' + titulo);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fig.click(); }
    });
  });

  /* ================= LIGHTBOX ================= */
  const lb = $('#lightbox');
  const lbCaja = $('.lightbox-caja');
  const lbTitulo = $('#lightbox-titulo');
  const lbCerrar = $('#lightbox-cerrar');
  let ultimoFoco = null;
  let contenidoActual = null;

  function abreLightbox(src, titulo, esVideo) {
    ultimoFoco = document.activeElement;
    if (contenidoActual) { contenidoActual.remove(); contenidoActual = null; }
    const el = document.createElement(esVideo ? 'video' : 'img');
    el.src = src;
    if (esVideo) {
      el.controls = true;
      el.autoplay = true;
      el.playsInline = true;
      el.muted = false;
    } else {
      el.alt = titulo || '';
    }
    lbCaja.insertBefore(el, lbCaja.firstChild);
    contenidoActual = el;
    if (lbTitulo) lbTitulo.textContent = titulo || '';
    lb.classList.add('abierta');
    document.addEventListener('keydown', teclas);
    setTimeout(() => lbCerrar && lbCerrar.focus(), 60);
  }
  function cierraLightbox() {
    lb.classList.remove('abierta');
    if (contenidoActual) {
      if (contenidoActual.tagName === 'VIDEO') contenidoActual.pause();
      setTimeout(() => { contenidoActual && contenidoActual.remove(); contenidoActual = null; }, 250);
    }
    document.removeEventListener('keydown', teclas);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  function teclas(e) {
    if (e.key === 'Escape') cierraLightbox();
  }
  if (lb) {
    lbCerrar.addEventListener('click', cierraLightbox);
    lb.addEventListener('click', (e) => { if (e.target === lb) cierraLightbox(); });
  }

  // contactos crudos + capturas de proceso → lightbox
  $$('.contacto').forEach((fig) => {
    const img = $('img', fig);
    const pie = $('figcaption', fig);
    const titulo = pie ? pie.textContent : 'Foto del equipo';
    fig.addEventListener('click', () => abreLightbox(img.src, titulo, false));
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Ampliar: ' + titulo);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fig.click(); }
    });
  });
  $$('.proceso-foto').forEach((fig) => {
    const img = $('img', fig);
    const pie = $('figcaption', fig);
    fig.addEventListener('click', () => abreLightbox(img.src, pie ? pie.textContent : 'Proceso', false));
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Ampliar ' + (pie ? pie.textContent : 'captura'));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fig.click(); }
    });
  });
})();
