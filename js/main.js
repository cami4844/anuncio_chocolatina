/* ============================================================
   CHACOQUIRA — MAIN
   Arranque, preloader, cursor, partículas, navegación, audio,
   magnetismo, inclinaciones y render de contenido dinámico.
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const CFG = window.CHACO_CONFIG;
  const DATOS = window.CHACO_DATOS;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esMovil = window.matchMedia('(max-width: 760px)').matches;

  /* El puntero es siempre el cursor nativo del sistema: lo que se ve es
     exactamente donde se hace clic, en todas las páginas. */

  /* ================= PRELOADER =================
     Sale con el DOM listo (+ una animación mínima), NO con window.load.
     Así la experiencia abre de inmediato aunque el resto de recursos
     (video, 3D bajo demanda) siga llegando en segundo plano. */
  const pre = $('#preloader');
  let preListo = false;
  function preAvance(p) {
    if (!pre) return;
    pre.style.setProperty('--pre', Math.min(100, Math.round(p)) + '%');
    const dato = $('.pre-dato');
    if (dato) dato.textContent = Math.min(100, Math.round(p)) + '%';
  }
  function preFuera() {
    if (preListo) return;
    preListo = true;
    preAvance(100);
    if (pre) pre.classList.add('fuera');
    document.dispatchEvent(new CustomEvent('chaco:preloader-fuera'));
  }
  preAvance(12);
  const logoPre = new Image();
  logoPre.onload = () => preAvance(52);
  logoPre.src = 'assets/img/logo.webp';
  // la barra avanza sola mientras el DOM termina de montar (nunca bloquea)
  let preProg = 12;
  const preT = setInterval(() => { preProg += (90 - preProg) * 0.16; preAvance(preProg); }, 110);
  let preCerrado = false;
  function preCierra() {
    if (preCerrado) return;
    preCerrado = true;
    clearInterval(preT);
    setTimeout(preFuera, reducido ? 60 : 240);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(preCierra, 300));
  window.addEventListener('load', preCierra);
  setTimeout(preCierra, 2600); // red de seguridad

  /* ================= NAVEGACIÓN ================= */
  const nav = $('#nav');
  function navEstado() {
    if (nav) nav.classList.toggle('compacta', window.scrollY > 40);
  }
  window.addEventListener('scroll', navEstado, { passive: true });
  navEstado();

  const mapSecciones = [['inicio', '#inicio'], ['concepto', '#concepto'], ['comercial', '#comercial'], ['celebraciones', '#celebraciones'], ['coleccion', '#coleccion'], ['escenas', '#escenas'], ['cierre', '#cierre']];
  const enlacesNav = new Map();
  $$('.nav-links a').forEach((a) => {
    const id = (a.getAttribute('href') || '').replace('#', '');
    if (id) enlacesNav.set(id, a);
  });
  const obsNav = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      enlacesNav.forEach((a) => a.classList.remove('activo'));
      const a = enlacesNav.get(en.target.id);
      if (a) a.classList.add('activo');
    });
  }, { rootMargin: '-42% 0px -52% 0px' });
  mapSecciones.forEach(([id]) => {
    const s = document.getElementById(id);
    if (s) obsNav.observe(s);
  });

  /* ================= AUDIO DEL SPOT ================= */
  const btnAudio = $('#btn-audio');
  const audio = new Audio(CFG.media.audioSpot);
  audio.preload = 'none';
  audio.addEventListener('ended', () => audioEstado(false));
  function audioEstado(sonando) {
    if (btnAudio) {
      btnAudio.classList.toggle('sonando', sonando);
      btnAudio.setAttribute('aria-pressed', String(sonando));
    }
    const caja = $('.spot-audio');
    if (caja) caja.classList.toggle('sonando', sonando);
    const disco = $('.spot-disco');
    if (disco) disco.classList.toggle('girando', sonando);
  }
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      if (audio.paused) {
        document.dispatchEvent(new CustomEvent('chaco:pausar-video'));
        audio.play().then(() => audioEstado(true)).catch(() => {});
      } else {
        audio.pause();
        audioEstado(false);
      }
    });
  }
  // el reproductor del comercial avisa para detener el audio
  document.addEventListener('chaco:pausar-audio', () => { audio.pause(); audioEstado(false); });
  const btnSpot = $('#btn-spot');
  if (btnSpot) btnSpot.addEventListener('click', () => btnAudio && btnAudio.click());

  /* ================= PALABRAS REVELABLES ================= */
  $$('.palabras').forEach((el) => {
    const nodos = Array.from(el.childNodes);
    el.textContent = '';
    nodos.forEach((nodo) => {
      if (nodo.nodeType === 3) {
        nodo.textContent.split(/\s+/).filter(Boolean).forEach((pal) => {
          const s = document.createElement('span');
          s.className = 'rev-palabra';
          s.textContent = pal;
          el.appendChild(s);
          el.appendChild(document.createTextNode(' '));
        });
      } else if (nodo.nodeType === 1) {
        if (nodo.classList) nodo.classList.add('rev-palabra');
        el.appendChild(nodo);
        el.appendChild(document.createTextNode(' '));
      }
    });
  });

  /* ================= RENDER: CELEBRACIONES ================= */
  function panelCelebracion(c, extraClase) {
    const art = document.createElement('article');
    art.className = 'celebra-panel' + (extraClase ? ' ' + extraClase : '');
    art.style.setProperty('--panel-color', c.color);
    art.innerHTML = `
      <div class="celebra-media" data-video="${c.video}" data-poster="${c.poster}">
        <img src="${c.poster}" alt="" loading="lazy" decoding="async">
      </div>
      <div class="celebra-filo"></div>
      <div class="celebra-info">
        <span class="celebra-num rev">${c.numero}</span>
        <h3 class="celebra-nombre rev">${c.nombre}</h3>
        <span class="chip celebra-fecha"><span class="punto"></span>${c.fecha}</span>
        <p class="celebra-producto rev">${c.producto}</p>
        <p class="celebra-linea rev">${c.linea}. ${c.descripcion}</p>
      </div>`;
    return art;
  }
  const pista = $('#celebra-pista');
  if (pista) {
    const intro = document.createElement('article');
    intro.className = 'celebra-panel celebra-panel-intro';
    intro.style.setProperty('--panel-color', '#e9b95c');
    intro.innerHTML = `
      <div class="caja">
        <span class="kicker">El calendario dulce</span>
        <h2 class="h2-grande">Seis fechas.<br><span class="acento-i">Seis chocolates.</span></h2>
        <p class="texto-suave" style="max-width:52ch">Todo el año tiene sabor CHACOQUIRA. Desliza y recorre las seis celebraciones, cada una con su pieza.</p>
        <div class="numerales">
          ${DATOS.celebraciones.map((c) => `<span>${c.numero}</span>`).join('')}
        </div>
        <span class="chip"><span class="punto"></span>Desliza para recorrer</span>
      </div>`;
    pista.appendChild(intro);
    DATOS.celebraciones.forEach((c) => pista.appendChild(panelCelebracion(c)));
    // panel de cierre del carrusel: los seis juntos
    const cc = DATOS.cierreColeccion;
    const cierre = panelCelebracion({
      numero: '✦',
      nombre: 'Las seis, juntas',
      fecha: 'Todo el año',
      producto: 'La colección completa',
      linea: 'Una persona, seis celebraciones, una sola marca.',
      descripcion: 'Y cuando se juntan en la misma mesa, el año completo sabe a CHACOQUIRA.',
      video: cc.video,
      poster: cc.poster,
      color: '#e9b95c'
    }, 'celebra-panel-cierre');
    pista.appendChild(cierre);
  }

  /* ================= RENDER: COMPARADORES ANTES / DESPUÉS ================= */
  const cajaComp = $('#comparadores');
  if (cajaComp) {
    DATOS.comparaciones.forEach((comp) => {
      const el = document.createElement('figure');
      el.className = 'comparador rev';
      el.innerHTML = `
        <div class="comparador-escena" data-cursor="pulso" tabindex="0" role="slider"
             aria-label="Comparación antes y después de ${comp.nombre}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
          <img class="img-antes" src="${comp.antes}" alt="Toma real de ${comp.nombre} en el patio del colegio" loading="lazy" decoding="async">
          <img class="img-despues" src="${comp.despues}" alt="Retrato transformado con IA de ${comp.nombre}" loading="lazy" decoding="async">
          <div class="comparador-mango"></div>
          <span class="comparador-etiqueta izq">Toma real</span>
          <span class="comparador-etiqueta der">Transformado con IA</span>
        </div>
        <figcaption class="comparador-pie">
          <div class="fila1">
            <h3>${comp.nombre}</h3>
            <span class="celeb">${comp.celeb}</span>
          </div>
          <p>${comp.nota}</p>
        </figcaption>`;
      cajaComp.appendChild(el);
    });
  }

  /* ================= RENDER: MOSAICO DE TOMAS ================= */
  const cajaTomas = $('#mosaico-tomas');
  if (cajaTomas) {
    let n = 0;
    DATOS.tomas.forEach((t) => {
      t.imagenes.forEach((src) => {
        n += 1;
        const el = document.createElement('figure');
        // mosaico: algunas piezas grandes para romper la cuadrícula uniforme
        const grande = n % 5 === 1 || n % 5 === 4;
        el.className = 'mosaico-item rev' + (grande ? ' mosaico-grande' : '');
        el.innerHTML = `
          <img src="${src}" alt="${t.titulo}" loading="lazy" decoding="async">
          <figcaption class="mosaico-pie">
            <span class="t">${t.titulo}</span>
            <span class="p">${t.persona}</span>
          </figcaption>`;
        cajaTomas.appendChild(el);
      });
    });
  }

  /* ================= RENDER: CONTACTOS + PROCESO + EQUIPO ================= */
  const franja = $('#contactos-franja');
  if (franja) {
    DATOS.contactos.forEach((c) => {
      const fig = document.createElement('figure');
      fig.className = 'contacto rev' + (c.transformada ? ' contacto-transformada' : '');
      fig.innerHTML = `<img src="${c.src}" alt="${c.pie} del equipo" loading="lazy" decoding="async"><figcaption>${c.pie}</figcaption>`;
      franja.appendChild(fig);
    });
  }
  const pila = $('#proceso-pila');
  if (pila) {
    DATOS.proceso.forEach((p) => {
      const fig = document.createElement('figure');
      fig.className = 'proceso-foto rev';
      fig.innerHTML = `<img src="${p.img}" alt="${p.pie}" loading="lazy" decoding="async"><figcaption>${p.pie}</figcaption>`;
      pila.appendChild(fig);
    });
  }
  const fila = $('#equipo-fila');
  if (fila) {
    DATOS.equipo.forEach((m) => {
      const el = document.createElement('div');
      el.className = 'miembro rev';
      el.innerHTML = `<img src="${m.foto}" alt="Retrato transformado de ${m.nombre}" loading="lazy" decoding="async"><span class="nom">${m.nombre}</span><span class="rol">${m.celeb}</span>`;
      fila.appendChild(el);
    });
  }

  /* ================= PARTÍCULAS MASMELo (hero) ================= */
  // (masmelos flotantes: blanco y rosa, reaccionan al cursor)
  function sistemaParticulas(canvas, opciones) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr;
    let particulas = [];
    const raton = { x: -9999, y: -9999, vx: 0, vy: 0 };
    const N = opciones.cantidad;

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function crear(desdeAbajo) {
      const p = {
        x: Math.random() * W,
        y: desdeAbajo ? H + 20 : Math.random() * H,
        tam: 4 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.01,
        vy: 0.15 + Math.random() * 0.5,
        fase: Math.random() * Math.PI * 2,
        amp: 0.2 + Math.random() * 0.6,
        rosa: Math.random() < 0.32,
        empujeX: 0,
        tipo: 'fondo'
      };
      particulas.push(p);
      if (particulas.length > N + 90) particulas.shift();
      return p;
    }
    for (let i = 0; i < N; i++) crear(false);

    function dibuja(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const alpha = p.tipo === 'burst' ? Math.max(0, p.vida / 60) : Math.min(1, p.tam / 9) * 0.85;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.rosa ? 'rgba(255, 214, 228, 0.95)' : 'rgba(255, 246, 235, 0.95)';
      const r = p.tam / 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-r, -r * 0.72, p.tam, p.tam * 1.44, r * 0.6);
      else ctx.rect(-r, -r * 0.72, p.tam, p.tam * 1.44);
      ctx.fill();
      ctx.restore();
    }
    function paso() {
      ctx.clearRect(0, 0, W, H);
      let hayMuertos = false;
      particulas.forEach((p) => {
        if (p.tipo === 'burst') {
          p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vida -= 1; p.rot += p.vr * 4;
          if (p.vida <= 0) { p.muerto = true; hayMuertos = true; }
        } else {
          p.fase += 0.012;
          p.y -= p.vy * p.amp;
          p.x += Math.sin(p.fase) * 0.3 + p.empujeX;
          p.empujeX *= 0.92;
          p.rot += p.vr;
          const dx = p.x - raton.x, dy = p.y - raton.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const d = Math.sqrt(d2) || 1;
            p.empujeX = (dx / d) * (120 - d) * 0.04;
          }
          if (p.y < -30) { p.y = H + 24; p.x = Math.random() * W; }
        }
        dibuja(p);
      });
      // ESTABILIDAD: solo filtramos cuando de verdad hay muertos (evita
      // asignar un array nuevo en cada frame durante toda la sesión)
      if (hayMuertos) particulas = particulas.filter((p) => !p.muerto);
    }
    /* ESTABILIDAD v4: el bucle se DUERME cuando el lienzo no está en
       pantalla y se despierta al volver. Antes requestAnimationFrame se
       re-programaba para siempre (2 lienzos = trabajo perpetuo). */
    let rafId = 0;
    function bucle() {
      rafId = 0;
      if (!activo) return;
      paso();
      rafId = requestAnimationFrame(bucle);
    }
    function despierta() { if (!rafId && activo) rafId = requestAnimationFrame(bucle); }
    let activo = true;
    if (reducido) { activo = false; }

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      const nx = e.clientX - r.left, ny = e.clientY - r.top;
      raton.vx = nx - raton.x; raton.vy = ny - raton.y;
      raton.x = nx; raton.y = ny;
    }, { passive: true });
    canvas.parentElement.addEventListener('mouseleave', () => { raton.x = -9999; raton.y = -9999; });

    window.addEventListener('resize', () => { medir(); });
    medir();
    if (!reducido) {
      // solo dibuja cuando el contenedor es visible; dormido el resto del tiempo
      new IntersectionObserver((en) => {
        activo = en[0].isIntersecting;
        if (activo) despierta();
      }, { threshold: 0.02 }).observe(canvas.parentElement);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) despierta(); });
      despierta();
    }
    return {
      estalla(x, y, n) {
        if (reducido) return;
        const r = canvas.getBoundingClientRect();
        for (let i = 0; i < (n || 40); i++) {
          const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 3.4;
          const p = crear(false);
          p.tipo = 'burst';
          p.x = x - r.left; p.y = y - r.top;
          p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 2;
          p.vida = 60 + Math.random() * 30;
          p.tam = 4 + Math.random() * 7;
          p.rosa = Math.random() < 0.5;
        }
      }
    };
  }

  const heroCanvas = $('#hero-particulas');
  let particulasHero = null;
  if (heroCanvas) {
    particulasHero = sistemaParticulas(heroCanvas, { cantidad: esMovil ? 18 : 42 });
    window.CHACO_ESTALLA = (x, y, n) => particulasHero && particulasHero.estalla(x, y, n);
  }
  const cierreCanvas = $('#cierre-particulas');
  if (cierreCanvas) {
    const particulasCierre = sistemaParticulas(cierreCanvas, { cantidad: esMovil ? 12 : 26 });
    window.CHACO_ESTALLA_CIERRE = (x, y, n) => particulasCierre && particulasCierre.estalla(x, y, n);
  }

  /* ================= CREDITOS FINALES (sorpresa de cierre) ================= */
  const creditos = $('#creditos');
  const cierreLogo = $('#cierre-logo');
  if (creditos && cierreLogo) {
    const rollo = $('#creditos-rollo');
    const cierra = () => {
      creditos.classList.remove('abierta');
      creditos.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', teclaCierra);
    };
    const teclaCierra = (e) => { if (e.key === 'Escape') cierra(); };

    // contenido del rollo: reparto real + gracias con humor de rodaje
    const fila = (tit, nom, rol) => `
      <div class="bloque">
        <span class="tit">${tit}</span>
        ${nom ? `<span class="nom">${nom}</span>` : ''}
        ${rol ? `<span class="rol">${rol}</span>` : ''}
      </div>`;
    rollo.innerHTML = `
      <div class="bloque"><span class="tit">Chacoquira presenta</span></div>
      <img src="assets/img/logo.webp" alt="CHACOQUIRA">
      <div class="bloque"><span class="tit">Una producción del equipo</span></div>
      ${DATOS.equipo.map((m) => fila(m.celeb, m.nombre, '')).join('')}
      ${fila('Dirección y guion', 'El equipo Chacoquira', '')}
      ${fila('Fotografía', 'El patio del colegio', 'Luz natural de las diez de la mañana')}
      ${fila('Vestuario', 'El uniforme de siempre', 'Con mucho orgullo')}
      ${fila('Transformación', 'Inteligencia artificial', 'Con supervisión humana y Paciencia')}
      ${fila('Chocolate', 'El bueno', 'Chocolate premium + masmelos')}
      ${fila('Agradecimientos', '', 'El recreo — Las tomas falsas — La risa de Mafe')}
      <div class="bloque">
        <span class="fin">Fin</span>
        <span class="eslogan-fin">Cada celebración tiene su chocolate.</span>
        <span class="rol">Siente la ocasión. Siente Chacoquira.</span>
      </div>`;

    const pistas = $('#cierre-pista');
    cierreLogo.addEventListener('click', (e) => {
      if (pistas) pistas.style.display = 'none';
      // reinicia la animación del rollo en cada apertura
      creditos.classList.remove('abierta');
      void creditos.offsetWidth;
      creditos.classList.add('abierta');
      creditos.setAttribute('aria-hidden', 'false');
      document.addEventListener('keydown', teclaCierra);
      window.CHACO_ESTALLA_CIERRE && window.CHACO_ESTALLA_CIERRE(e.clientX, e.clientY, 46);
    });
    $('#creditos-cerrar').addEventListener('click', cierra);
    creditos.addEventListener('click', (e) => { if (e.target === creditos) cierra(); });
  }

  // huevo de pascua: tres clics en el logo del hero (la corona)
  const coronaZona = $('#hero-logo img');
  if (coronaZona) {
    let clics = 0, tRest = 0;
    coronaZona.addEventListener('click', (e) => {
      clearTimeout(tRest);
      clics += 1;
      if (clics >= 3) {
        clics = 0;
        window.CHACO_ESTALLA && window.CHACO_ESTALLA(e.clientX, e.clientY, 60);
      }
      tRest = setTimeout(() => { clics = 0; }, 1200);
    });
  }

  /* ================= BRILLO DEL MOUSE EN HERO ================= */
  const brillo = $('.brillo-mouse');
  if (brillo && fino && !reducido) {
    const hero = $('#inicio');
    let bx = 0, by = 0, tx = 0, ty = 0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      brillo.classList.add('visible');
    }, { passive: true });
    hero.addEventListener('mouseleave', () => brillo.classList.remove('visible'));
    (function sigue() {
      bx += (tx - bx) * 0.08; by += (ty - by) * 0.08;
      // ESTABILIDAD: transform en vez de left/top (sin layout por frame)
      brillo.style.transform = 'translate3d(' + bx + 'px,' + by + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(sigue);
    })();
  }

  /* ================= MAGNETISMO =================
   Retirado: los botones ya se desplazan al acercar el mouse y eso
   hacía percibir el clic «en otra parte». Objetos fijos = puntero
   100% coherente. */

  /* ================= INCLINACIÓN 3D (empaque) ================= */
  if (fino && !reducido) {
    const marco = $('#empaque-marco');
    if (marco) {
      const escena = marco.parentElement;
      escena.addEventListener('mousemove', (e) => {
        const r = marco.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        marco.style.transform = `perspective(1100px) rotateY(${dx * 7}deg) rotateX(${-dy * 5}deg)`;
      });
      escena.addEventListener('mouseleave', () => { marco.style.transform = ''; });
    }
  }

  /* ================= VIDEO DE FONDO DEL HERO ================= */
  const heroVideo = $('#hero-video');
  if (heroVideo) {
    heroVideo.src = CFG.media.heroLoop;
    heroVideo.addEventListener('canplay', () => heroVideo.classList.add('pronto'), { once: true });
    if (!reducido) {
      heroVideo.addEventListener('error', () => { heroVideo.style.display = 'none'; });
      const prom = heroVideo.play();
      if (prom && prom.catch) prom.catch(() => {});
    }
  }

  /* ================= CIERRE: QR / REDES ================= */
  const qrNota = $('#qr-nota');
  if (qrNota && CFG.qr && CFG.qr.nota) qrNota.textContent = CFG.qr.nota;
  const cajaRedes = $('#cierre-redes');
  if (cajaRedes) {
    if (CFG.redes && CFG.redes.length) {
      CFG.redes.forEach((r) => {
        const a = document.createElement('a');
        a.className = 'chip';
        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.innerHTML = `<span class="punto"></span>${r.nombre} ${r.usuario || ''}`;
        cajaRedes.appendChild(a);
      });
    } else {
      const s = document.createElement('span');
      s.className = 'chip';
      s.innerHTML = '<span class="punto"></span>Redes sociales — Próximamente';
      cajaRedes.appendChild(s);
    }
  }
  const anio = $('#anio');
  if (anio) anio.textContent = CFG.ajustes.anio;

  /* ================= EXPOSE UTILIDADES ================= */
  window.CHACO_UTIL = { $, $$, reducido, fino, esMovil };
})();
