/* ============================================================
   CHACOQUIRA — UTILIDADES COMPARTIDAS DE LAS INTERFACES DE MARCA
   (redes/*.html)
   - toast uniforme;
   - MEMORIA DE NAVEGACIÓN: cada interfaz recuerda su posición
     de scroll y sus estados ligeros (sessionStorage) para que
     volver de otra interfaz sea "continuar donde estabas";
   - detector de doble toque (móvil y escritorio).
   Sin backend: todo es simulación local honesta.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- toast ---------- */
  var toastEl = null;
  var toastTimer = null;
  function avisar(msg) {
    if (!toastEl) toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('visible'); }, 2300);
  }

  /* ---------- memoria de navegación ---------- */
  function claveScroll() { return 'chaco-scroll:' + location.pathname; }
  function claveEstado() { return 'chaco-estado:' + location.pathname; }

  function guardaEstado(obj) {
    try { sessionStorage.setItem(claveEstado(), JSON.stringify(obj || {})); } catch (e) {}
  }
  function leeEstado() {
    try { return JSON.parse(sessionStorage.getItem(claveEstado()) || '{}'); }
    catch (e) { return {}; }
  }

  function restauraScroll() {
    try {
      var y = parseInt(sessionStorage.getItem(claveScroll()) || '0', 10);
      if (y > 60) window.scrollTo(0, y);
    } catch (e) {}
  }
  function instalaMemoria() {
    /* restaura de inmediato y de nuevo cuando las imágenes asientan el layout */
    restauraScroll();
    window.addEventListener('load', restauraScroll);
    setTimeout(restauraScroll, 350);
    var t = null;
    window.addEventListener('scroll', function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        try { sessionStorage.setItem(claveScroll(), String(Math.round(window.scrollY))); } catch (e) {}
      }, 160);
    }, { passive: true });
  }

  /* ---------- doble toque (móvil) / doble clic (escritorio) ---------- */
  function enDobleToque(el, fn) {
    if (!el) return;
    var ultimo = 0;
    el.addEventListener('click', function (e) {
      var ahora = Date.now();
      if (ahora - ultimo < 320) {
        ultimo = 0;
        fn(e);
      } else {
        ultimo = ahora;
      }
    });
    el.addEventListener('dblclick', function (e) { e.preventDefault(); });
  }

  window.CHACO_RED = {
    avisar: avisar,
    guardaEstado: guardaEstado,
    leeEstado: leeEstado,
    instalaMemoria: instalaMemoria,
    enDobleToque: enDobleToque
  };
})();
