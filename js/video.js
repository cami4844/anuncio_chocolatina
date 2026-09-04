/* ============================================================
   CHACOQUIRA — REPRODUCTOR DEL COMERCIAL
   Patrón a prueba de todo:
   - El fullscreen solo con gesto explícito (botón), nunca automático.
   - El poster vive DETRÁS del video, sin interceptar clics.
   - Cadena de reintentos de play() (normal → silenciado → controles nativos).
   - Al terminar: "Ver de nuevo" (ningún cierre forzado).
   - Binds idempotentes: los re-clics no corrompen el estado.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const CFG = window.CHACO_CONFIG;
  const escenario = $('#cine-escenario');
  if (!escenario) return;

  const video = $('#comercial-video');
  const poster = $('#cine-poster');
  const btnCentral = $('#btn-play-central');
  const btnPlay = $('#cine-btn-play');
  const btnMute = $('#cine-btn-mute');
  const btnFull = $('#cine-btn-full');
  const progreso = $('#cine-progreso');
  const riel = $('.cine-progreso .riel');
  const llenado = $('.cine-progreso .llenado');
  const tiempo = $('#cine-tiempo');
  const errorCaja = $('#cine-error');
  const svgPlay = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const svgPausa = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  const svgVolumen = '<svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
  const svgSilencio = '<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5v-.7zM3 9v6h4l5 5v-6.8L5.3 6.5 3 9zm18.7 10.3-1.4 1.4L3.3 3.3 4.7 1.9l17 17.4z"/></svg>';

  let yaVinculado = false;
  let usandoNativos = false;

  function formatea(t) {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function retiraPoster() {
    if (!poster.classList.contains('oculto')) {
      poster.classList.add('oculto');
      setTimeout(() => { if (!video.paused) poster.style.display = 'none'; }, 600);
    } else if (!video.paused) {
      poster.style.display = 'none';
    }
  }
  function muestraPoster() {
    poster.style.display = '';
    // fuerza reflow para que la transición de opacidad corra
    void poster.offsetWidth;
    poster.classList.remove('oculto');
  }

  function marcaReproduciendo() {
    escenario.classList.add('reproduciendo');
    btnPlay.innerHTML = svgPausa;
    document.dispatchEvent(new CustomEvent('chaco:pausar-audio'));
  }
  function marcaPausado() {
    escenario.classList.remove('reproduciendo');
    btnPlay.innerHTML = svgPlay;
  }

  function intentaReproducir(nivel) {
    const prom = video.play();
    if (prom && prom.catch) {
      prom.catch(() => {
        if (nivel === 0) {
          video.muted = true;
          actualizaMute();
          intentaReproducir(1);
        } else if (nivel === 1) {
          // último recurso: controles nativos
          video.controls = true;
          usandoNativos = true;
          intentaReproducir(2);
        }
      });
    }
  }

  function reproducir() {
    if (usandoNativos) { intentaReproducir(2); return; }
    intentaReproducir(0);
  }

  function actualizaMute() {
    btnMute.innerHTML = video.muted ? svgSilencio : svgVolumen;
  }

  function actualizaTiempo() {
    const p = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    llenado.style.width = p.toFixed(2) + '%';
    tiempo.textContent = formatea(video.currentTime) + ' / ' + formatea(video.duration);
  }

  function bindOnce() {
    if (yaVinculado) return;
    yaVinculado = true;

    video.addEventListener('playing', () => { retiraPoster(); marcaReproduciendo(); });
    video.addEventListener('pause', marcaPausado);
    video.addEventListener('timeupdate', () => { retiraPoster(); actualizaTiempo(); });
    video.addEventListener('loadedmetadata', actualizaTiempo);
    video.addEventListener('progress', () => {
      if (video.buffered.length && video.duration) {
        const fin = video.buffered.end(video.buffered.length - 1);
        // el riel muestra el avance del búfer como relleno suave del fondo
        riel.style.setProperty('--buffer', ((fin / video.duration) * 100).toFixed(1) + '%');
      }
    });
    video.addEventListener('ended', () => {
      marcaPausado();
      muestraPoster();
      escenario.classList.add('terminado');
    });
    video.addEventListener('error', () => {
      errorCaja.classList.add('visible');
      btnCentral.style.display = 'none';
      muestraPoster();
    });
    // el video ya trae audio del comercial: al reproducir, silencia el spot suelto
    video.addEventListener('play', () => document.dispatchEvent(new CustomEvent('chaco:pausar-audio')));

    btnCentral.addEventListener('click', reproducir);
    btnPlay.addEventListener('click', () => {
      if (video.paused || video.ended) reproducir();
      else video.pause();
    });
    btnMute.addEventListener('click', () => {
      video.muted = !video.muted;
      video.volume = 1;
      actualizaMute();
    });
    btnFull.addEventListener('click', () => {
      // fullscreen SOLO con gesto real, sobre el contenedor
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
        return;
      }
      const req = escenario.requestFullscreen || escenario.webkitRequestFullscreen;
      if (req) {
        const prom = escenario.requestFullscreen();
        if (prom && prom.catch) prom.catch(() => {
          if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
        });
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    });

    // barrido en la barra de progreso
    let arrastrando = false;
    function busca(clientX) {
      const r = riel.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (video.duration) {
        video.currentTime = p * video.duration;
        llenado.style.width = (p * 100).toFixed(2) + '%';
      }
    }
    progreso.addEventListener('pointerdown', (e) => {
      if (usandoNativos) return;
      arrastrando = true;
      try { progreso.setPointerCapture && progreso.setPointerCapture(e.pointerId); } catch (err) {}
      busca(e.clientX);
    });
    progreso.addEventListener('pointermove', (e) => { if (arrastrando) busca(e.clientX); });
    progreso.addEventListener('pointerup', () => { arrastrando = false; });

    // teclado sobre el escenario
    escenario.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement === escenario || document.activeElement === btnCentral) {
          e.preventDefault();
          if (video.paused || video.ended) reproducir(); else video.pause();
        }
      }
    });

    // la sección de audio pide pausar el video
    document.addEventListener('chaco:pausar-video', () => { if (!video.paused) video.pause(); });
    // pausa si el video queda fuera de vista (ahorro de datos)
    new IntersectionObserver((en) => {
      if (!en[0].isIntersecting && !video.paused && !document.fullscreenElement) video.pause();
    }, { threshold: 0.15 }).observe(escenario);
  }

  bindOnce();
  actualizaMute();
  actualizaTiempo();
  escenario.setAttribute('tabindex', '0');

  // media centralizada en config.js
  video.src = CFG.media.comercial;
  const posterImg = $('#cine-poster img');
  if (posterImg) posterImg.src = CFG.media.posterComercial;
  if (posterImg && posterImg.complete) muestraPoster();
})();
