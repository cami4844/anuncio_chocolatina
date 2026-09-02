/* ============================================================
   CHACOQUIRA — COLECCIÓN 3D
   Vitrina de productos con Three.js.
   - Carga perezosa: el modelo solo baja cuando la vitrina se acerca.
   - Decodificador Meshopt (modelos comprimidos con gltfpack).
   - Arrastrar para girar (con inercia), rueda/pellizco para zoom,
     doble clic para reencuadrar, auto-giro cuando nadie interactúa.
   - Si WebGL o la carga fallan: fallback elegante (no visor roto).
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const CFG = window.CHACO_CONFIG;

  const vitrina = $('#expo-vitrina');
  if (!vitrina) return;

  const canvasHost = $('#expo-canvas-host');
  const cargaCaja = $('#expo-cargando');
  const cargaDato = $('.expo-dato');
  const fallback = $('#expo-fallback');
  const notaFile = $('#expo-nota-file');
  const tabs = $$('.expo-tab');
  const detNombre = $('#expo-det-nombre');
  const detLinea = $('#expo-det-linea');
  const detDesc = $('#expo-det-desc');

  const esFile = location.protocol === 'file:';

  let renderer = null;
  let escena = null;
  let camara = null;
  let grupoModelo = null;
  let modeloActual = null;
  let mixerNulo = null;
  let reloj = null;
  let cargandoId = 0;
  let visible = false;
  let iniciado = false;
  let activo = CFG.modelos[0] ? CFG.modelos[0].id : null;

  // estado de interacción
  const st = {
    rotX: 0.12, rotY: -0.5,
    velX: 0, velY: 0,
    dist: 6.2, distObj: 6.2,
    arrastrando: false,
    ultimoX: 0, ultimoY: 0,
    punteros: new Map(),
    pinchInicial: 0,
    distInicial: 0,
    quietoDesde: 0,
    bob: 0
  };

  function creaNave() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    canvasHost.appendChild(renderer.domElement);

    escena = new THREE.Scene();
    camara = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    reloj = new THREE.Clock();

    // iluminación de estudio: cálida, con contra magenta de marca
    const hemi = new THREE.HemisphereLight(0xfff1dd, 0x1a0c05, 1.05);
    escena.add(hemi);

    const clave = new THREE.DirectionalLight(0xffe3b3, 1.9);
    clave.position.set(3.4, 5.2, 4.2);
    escena.add(clave);

    const contra = new THREE.DirectionalLight(0xff2d78, 1.0);
    contra.position.set(-4.6, 2.4, -3.6);
    escena.add(contra);

    const relleno = new THREE.DirectionalLight(0xcfd8ff, 0.5);
    relleno.position.set(-2.4, 1.6, 3.8);
    escena.add(relleno);

    const inferior = new THREE.DirectionalLight(0xffd9a0, 0.45);
    inferior.position.set(0.5, -2.2, 2.4);
    escena.add(inferior);

    // entorno cálido para reflejos (cubo generado, sin descargas)
    const caras = [];
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, '#8a5a30');
      grad.addColorStop(0.45, '#2c1608');
      grad.addColorStop(1, '#0b0502');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      if (i === 2) { // destello cálido desde arriba
        const r2 = g.createRadialGradient(32, 26, 3, 32, 26, 40);
        r2.addColorStop(0, 'rgba(255, 226, 170, 0.95)');
        r2.addColorStop(1, 'rgba(255, 226, 170, 0)');
        g.fillStyle = r2;
        g.fillRect(0, 0, 64, 64);
      }
      if (i === 1) { // reflejo magenta de marca al costado
        const r3 = g.createRadialGradient(20, 34, 3, 20, 34, 34);
        r3.addColorStop(0, 'rgba(255, 45, 120, 0.5)');
        r3.addColorStop(1, 'rgba(255, 45, 120, 0)');
        g.fillStyle = r3;
        g.fillRect(0, 0, 64, 64);
      }
      caras.push(c);
    }
    const texEntorno = new THREE.CubeTexture(caras);
    texEntorno.needsUpdate = true;
    escena.userData.texEntorno = texEntorno;

    // piso de reflejo cálido (gradiente radial generado)
    const tex = document.createElement('canvas');
    tex.width = tex.height = 256;
    const g = tex.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    grad.addColorStop(0, 'rgba(233,185,92,0.5)');
    grad.addColorStop(0.45, 'rgba(233,185,92,0.14)');
    grad.addColorStop(1, 'rgba(233,185,92,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const texPiso = new THREE.CanvasTexture(tex);
    const piso = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 7.2),
      new THREE.MeshBasicMaterial({ map: texPiso, transparent: true, depthWrite: false })
    );
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.02;
    escena.add(piso);

    grupoModelo = new THREE.Group();
    escena.add(grupoModelo);

    ajustaTamano();
    window.addEventListener('resize', ajustaTamano);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(ajustaTamano).observe(vitrina);
  }

  function ajustaTamano() {
    if (!renderer) return;
    const w = vitrina.clientWidth || 1;
    const h = vitrina.clientHeight || 1;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  }

  function limpiaModelo() {
    if (!modeloActual) return;
    modeloActual.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); });
          m.dispose();
        });
      }
    });
    grupoModelo.remove(modeloActual);
    modeloActual = null;
  }

  function entraModelo() {
    if (window.gsap) {
      grupoModelo.scale.setScalar(0.001);
      grupoModelo.position.y = -0.55;
      window.gsap.to(grupoModelo.scale, { x: 1, y: 1, z: 1, duration: 1.15, ease: 'back.out(1.4)' });
      window.gsap.to(grupoModelo.position, { y: 0, duration: 1.15, ease: 'power3.out' });
    } else {
      grupoModelo.scale.setScalar(1);
    }
  }

  function encajaModelo(objeto) {
    const caja = new THREE.Box3().setFromObject(objeto);
    const tam = caja.getSize(new THREE.Vector3());
    const centro = caja.getCenter(new THREE.Vector3());
    const mayor = Math.max(tam.x, tam.y, tam.z) || 1;
    const escala = 3.1 / mayor;
    objeto.scale.setScalar(escala);
    objeto.position.sub(centro.multiplyScalar(escala));
    objeto.position.y += (tam.y * escala) / 2 - 0.35; // apoyado sobre el piso
    return objeto;
  }

  function cargaModelo(def) {
    const miId = ++cargandoId;
    cargaCaja.classList.remove('fuera');
    fallback.classList.remove('visible');
    if (cargaDato) cargaDato.textContent = 'Preparando la pieza — 0%';

    const loader = new THREE.GLTFLoader();
    if (typeof MeshoptDecoder !== 'undefined') {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    const gestion = (pct) => {
      if (miId === cargandoId && cargaDato) cargaDato.textContent = 'Preparando la pieza — ' + pct + '%';
    };

    fetch(def.url)
      .then((resp) => {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        if (!resp.body) return resp.arrayBuffer();
        const total = parseInt(resp.headers.get('Content-Length') || '0', 10);
        const lector = resp.body.getReader();
        let recibido = 0;
        const trozos = [];
        function bombea() {
          return lector.read().then(({ done, value }) => {
            if (miId !== cargandoId) { lector.cancel(); throw new Error('cancelada'); }
            if (done) {
              const buf = new Uint8Array(recibido);
              let off = 0;
              trozos.forEach((t) => { buf.set(t, off); off += t.length; });
              return buf.buffer;
            }
            recibido += value.length;
            trozos.push(value);
            if (total) gestion(Math.round((recibido / total) * 100));
            return bombea();
          });
        }
        return bombea();
      })
      .then((buffer) => {
        if (miId !== cargandoId) return;
        return new Promise((resolve, reject) => {
          loader.parse(buffer, '', (gltf) => resolve(gltf), reject);
        });
      })
      .then((gltf) => {
        if (miId !== cargandoId) return;
        limpiaModelo();
        // sintonía de materiales: reflejos con el entorno cálido y legibilidad
        const texEntorno = escena.userData.texEntorno || null;
        gltf.scene.traverse((obj) => {
          if (obj.isMesh && obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              if (texEntorno) {
                m.envMap = texEntorno;
                m.envMapIntensity = 1.35;
              }
              if (typeof m.metalness === 'number' && m.metalness > 0.85) m.metalness = 0.72;
              if (typeof m.roughness === 'number' && m.roughness < 0.28) m.roughness = 0.34;
              m.needsUpdate = true;
            });
          }
        });
        modeloActual = encajaModelo(gltf.scene);
        grupoModelo.add(modeloActual);
        st.rotY = -0.5; st.rotX = 0.12; st.dist = st.distObj = 6.2;
        entraModelo();
        cargaCaja.classList.add('fuera');
        st.quietoDesde = performance.now();
      })
      .catch((err) => {
        if (miId !== cargandoId && String(err && err.message) !== 'cancelada') return;
        cargaCaja.classList.add('fuera');
        if (String(err && err.message) === 'cancelada') return;
        fallback.classList.add('visible');
        if (esFile && notaFile) notaFile.classList.add('visible');
      });
  }

  /* ---------- interacción ---------- */
  function vinceGestos() {
    vitrina.addEventListener('pointerdown', (e) => {
      vitrina.setPointerCapture && vitrina.setPointerCapture(e.pointerId);
      st.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (st.punteros.size === 1) {
        st.arrastrando = true;
        st.ultimoX = e.clientX; st.ultimoY = e.clientY;
        st.velX = st.velY = 0;
      } else if (st.punteros.size === 2) {
        const pts = Array.from(st.punteros.values());
        st.pinchInicial = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        st.distInicial = st.distObj;
      }
      st.quietoDesde = performance.now();
    });
    vitrina.addEventListener('pointermove', (e) => {
      if (!st.punteros.has(e.pointerId)) return;
      st.punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (st.punteros.size === 2) {
        const pts = Array.from(st.punteros.values());
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (st.pinchInicial > 0) {
          st.distObj = Math.min(9.5, Math.max(3.4, st.distInicial * (st.pinchInicial / d)));
        }
        return;
      }
      if (!st.arrastrando) return;
      const dx = e.clientX - st.ultimoX;
      const dy = e.clientY - st.ultimoY;
      st.ultimoX = e.clientX; st.ultimoY = e.clientY;
      st.velY = dx * 0.0045;
      st.velX = dy * 0.0032;
      st.rotY += st.velY;
      st.rotX = Math.min(0.85, Math.max(-0.55, st.rotX + st.velX));
      st.quietoDesde = performance.now();
    });
    function suelta(e) {
      st.punteros.delete(e.pointerId);
      if (st.punteros.size === 0) st.arrastrando = false;
    }
    vitrina.addEventListener('pointerup', suelta);
    vitrina.addEventListener('pointercancel', suelta);
    vitrina.addEventListener('wheel', (e) => {
      e.preventDefault();
      st.distObj = Math.min(9.5, Math.max(3.4, st.distObj + e.deltaY * 0.0038));
      st.quietoDesde = performance.now();
    }, { passive: false });
    vitrina.addEventListener('dblclick', () => {
      st.rotX = 0.12; st.rotY = -0.5; st.distObj = 6.2;
    });
  }

  /* ---------- bucle ---------- */
  function bucle() {
    requestAnimationFrame(bucle);
    if (!visible || !renderer) return;
    const dt = Math.min(0.05, reloj.getDelta());
    const t = reloj.elapsedTime;

    // inercia
    if (!st.arrastrando) {
      st.rotY += st.velY;
      st.rotX = Math.min(0.85, Math.max(-0.55, st.rotX + st.velX));
      st.velY *= 0.94; st.velX *= 0.9;
      // auto-giro tras 3 s de calma
      if (performance.now() - st.quietoDesde > 3000) st.rotY += dt * 0.22;
    }
    // flotación suave
    st.bob = Math.sin(t * 1.1) * 0.045;
    if (grupoModelo) grupoModelo.position.y = st.bob;

    st.dist += (st.distObj - st.dist) * 0.08;
    const cx = Math.sin(st.rotY) * st.dist;
    const cz = Math.cos(st.rotY) * st.dist;
    const cy = 1.15 + Math.sin(st.rotX) * st.dist * 0.55;
    camara.position.set(cx, Math.max(0.4, cy), cz);
    camara.lookAt(0, 0.35, 0);

    renderer.render(escena, camara);
  }

  /* ---------- interfaz ---------- */
  function eligeTab(id) {
    activo = id;
    const def = CFG.modelos.find((m) => m.id === id) || CFG.modelos[0];
    tabs.forEach((t) => t.classList.toggle('activo', t.getAttribute('data-modelo') === def.id));
    if (detNombre) detNombre.textContent = def.nombre;
    if (detLinea) detLinea.textContent = def.linea;
    if (detDesc) detDesc.textContent = def.descripcion;
    cargaModelo(def);
  }

  tabs.forEach((t) => t.addEventListener('click', () => eligeTab(t.getAttribute('data-modelo'))));
  const btnReintentar = $('#expo-reintentar');
  if (btnReintentar) btnReintentar.addEventListener('click', () => eligeTab(activo));

  // arranque perezoso: cuando la vitrina se acerca a la vista
  const obsArranque = new IntersectionObserver((en) => {
    if (!en[0].isIntersecting) return;
    obsArranque.disconnect();
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
      cargaCaja.classList.add('fuera');
      fallback.classList.add('visible');
      if (notaFile) notaFile.classList.add('visible');
      return;
    }
    if (!iniciado) {
      iniciado = true;
      try {
        creaNave();
        vinceGestos();
        // botones del panel: girar / acercar / alejar
        vitrina.addEventListener('chaco-vitrina', (e) => {
          if (e.detail === 'girar') st.velY += 0.09;
          if (e.detail === 'cerca') st.distObj = Math.max(3.4, st.distObj - 1.2);
          if (e.detail === 'lejos') st.distObj = Math.min(9.5, st.distObj + 1.2);
          st.quietoDesde = performance.now();
        });
        bucle();
        eligeTab(activo);
      } catch (e) {
        cargaCaja.classList.add('fuera');
        fallback.classList.add('visible');
      }
    }
  }, { rootMargin: '420px 0px' });
  obsArranque.observe(vitrina);

  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(vitrina);
})();
