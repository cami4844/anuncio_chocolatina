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
  // Cuando exista la URL definitiva del sitio, escríbela aquí.
  // El QR físico del empaque debe apuntar exactamente a esa URL.
  qr: {
    urlDestino: '',                       // EJ: 'https://chacoquira.com'  (vacío = pendiente)
    nota: 'El QR del empaque llegará a esta experiencia. URL por definir.'
  },

  // ---------- REDES SOCIALES ----------
  // Sin datos reales todavía: se muestran como "Próximamente".
  // Cuando existan, agrega: { nombre: 'Instagram', url: 'https://instagram.com/...', usuario: '@chacoquira' }
  redes: [],

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
      url: 'assets/modelo/chocolatina.glb'
    },
    {
      id: 'trozos',
      nombre: 'Trozos y Masmelos',
      linea: 'El quiebre perfecto',
      descripcion: 'Chocolate partido con masmelos asomando. La textura que define a la marca: firme por fuera, suave por dentro.',
      url: 'assets/modelo/chocolatinas.glb'
    }
  ],

  // ---------- AJUSTES ----------
  ajustes: {
    duracionComercial: '70',   // segundos, solo informativo
    calidadChip: 'HD',         // etiqueta del chip de calidad
    anio: 2026
  }
};
