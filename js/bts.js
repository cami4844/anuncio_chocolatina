/* ============================================================
   CHACOQUIRA — ESCENAS ELIMINADAS
   Comparadores antes/después (arrastre + teclado).
   ------------------------------------------------------------
   NOTA v5: el visor de ampliación de imágenes (lightbox) fue
   RETIRADO por decisión de protección: las imágenes del
   proyecto ya no se abren en grande, ni por clic, ni por
   teclado, ni por doble toque. Los comparadores de arrastre
   se conservan: no amplían nada, solo revelan dos capas.
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
})();
