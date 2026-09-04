/* ============================================================
   CHACOQUIRA — CONFIGURACIÓN GLOBAL
   Este archivo concentra todo lo editable del sitio.
   Cambia valores aquí y el sitio se actualiza completo.
   ============================================================ */

window.CHACO_CONFIG = {

  // ---------- MARCA ----------
  marca: {
    nombre: 'CHACOQUIRA',
    descriptor: 'CHOCOLATE + MASMELOS',
    eslogan: 'Cada celebración tiene su chocolate.',
    cierre: 'Siente la ocasión. Siente Chacoquira.',
    carta: 'Ediciones únicas para momentos increíbles'
  },

  // ---------- QR DEL EMPAQUE ----------
  // URL conocida del QR físico impreso en el empaque (NO regenerar el QR).
  // Si la arquitectura final cambia de dominio, documentar el impacto y
  // actualizar aquí; el QR físico seguiría apuntando a la URL original.
  qr: {
    urlDestino: 'https://cami4844.github.io/anuncio_chocolatina/',
    nota: 'El QR del empaque llega a esta experiencia web.'
  },

  // ---------- REDES SOCIALES ----------
  // Páginas de marca CHACOQUIRA (clon local en código, dentro de /redes).
  // Cuando existan perfiles reales, cambia cada url por la del perfil:
  // { nombre: 'Instagram', url: 'https://instagram.com/...', usuario: '@chacoquira' }
  redes: [
    { nombre: 'Instagram', url: 'redes/instagram.html', usuario: '@chacoquira' },
    { nombre: 'TikTok',    url: 'redes/tiktok.html',    usuario: '@chacoquira' },
    { nombre: 'Facebook',  url: 'redes/facebook.html',  usuario: 'CHACOQUIRA' },
    { nombre: 'WhatsApp',  url: 'redes/whatsapp.html',  usuario: 'Canal oficial' }
  ],

  // ---------- MEDIA PRINCIPAL ----------
  media: {
    comercial: 'assets/video/definitivo-web.mp4',
    posterComercial: 'assets/img/poster/comercial.jpg',
    posterHero: 'assets/img/poster/hero.jpg',
    audioSpot: 'assets/audio/chacoquira-spot.mp3',
    heroLoop: 'assets/video/hero-swirl.mp4'
  },

  // ---------- MODELOS 3D ----------
  modelos: [
    {
      id: 'chocolatina',
      nombre: 'Chocolatina Clásica',
      linea: 'La pieza de colección',
      descripcion: 'La chocolatina CHACOQUIRA con su envoltura de marca. Chocolate premium, formato perfecto para regalar (o no compartir).',
      url: 'assets/modelo/chocolatina.glb.js'
    },
    {
      id: 'trozos',
      nombre: 'Trozos y Masmelos',
      linea: 'El quiebre perfecto',
      descripcion: 'Chocolate partido con masmelos asomando. La textura que define a la marca: firme por fuera, suave por dentro.',
      url: 'assets/modelo/chocolatinas.glb.js'
    }
  ],

  // ---------- AJUSTES ----------
  ajustes: {
    duracionComercial: '70',   // segundos, solo informativo
    calidadChip: 'HD',         // etiqueta del chip de calidad
    anio: 2026
  },

  // ---------- PROTECCIÓN (capa navegador) ----------
  // Capas activas: anti-captura (escritorio + móvil), disuasión de copia,
  // aviso anti-IA codificado, velo de foco y registro Función D.
  // Sin marca de agua repetida (la v3 la elimina: era un bug visual).
  seguridad: {
    antiCaptura: true,         // [B] PrintScreen/Ctrl+P/U/S interceptados + velo al perder foco
    disuasionCopiado: true,    // [B] menú contextual/drag/long-press solo sobre medios
    consolaAviso: true,        // [B] aviso de propiedad + prohibición para IA en consola
    registroErrores: true      // [A] Función D: errores → localStorage, exportables
  }
};
