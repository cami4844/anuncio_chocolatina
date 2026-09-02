/* ============================================================
   CHACOQUIRA — DATOS DE CONTENIDO
   Las seis celebraciones, el equipo y las escenas eliminadas.
   Orden, productos y fechas tomados del arte oficial del empaque.
   ============================================================ */

window.CHACO_DATOS = {

  // ---------- LAS SEIS CELEBRACIONES (ORDEN DEFINITIVO) ----------
  celebraciones: [
    {
      id: 'pascua',
      numero: '01',
      nombre: 'Pascua',
      fecha: '5 de abril',
      producto: 'Huevo de Chocolate',
      linea: 'Relleno de masmelos',
      descripcion: 'El quiebre que arranca el año: chocolate premium que esconde la suavidad más cremosa.',
      video: 'assets/video/celebra/pascua.mp4',
      poster: 'assets/img/poster/pascua.jpg',
      color: '#f0d27a'
    },
    {
      id: 'madre',
      numero: '02',
      nombre: 'Día de la Madre',
      fecha: '10 de mayo',
      producto: 'Rosa de Chocolate',
      linea: 'La flor que no se marchita',
      descripcion: 'Una rosa tallada en chocolate premium para quien lo ha dado todo.',
      video: 'assets/video/celebra/madre.mp4',
      poster: 'assets/img/poster/madre.jpg',
      color: '#e08bb0'
    },
    {
      id: 'padre',
      numero: '03',
      nombre: 'Día del Padre',
      fecha: '21 de junio',
      producto: 'Corbata de Chocolate',
      linea: 'El traje más dulce del año',
      descripcion: 'Tejido en chocolate, nodo incluido. Para el estilo que no necesita corbata de verdad.',
      video: 'assets/video/celebra/padre.mp4',
      poster: 'assets/img/poster/padre.jpg',
      color: '#d99a4e'
    },
    {
      id: 'amor',
      numero: '04',
      nombre: 'Amor y Amistad',
      fecha: '19 de septiembre',
      producto: 'Corazón de Chocolate',
      linea: 'Para decirlo con masmelos',
      descripcion: 'Lo que las palabras dejan a medias, lo dice un corazón de chocolate.',
      video: 'assets/video/celebra/amor.mp4',
      poster: 'assets/img/poster/amor.jpg',
      color: '#ff4f87'
    },
    {
      id: 'halloween',
      numero: '05',
      nombre: 'Halloween',
      fecha: '31 de octubre',
      producto: 'Calabaza de Chocolate',
      linea: 'La sonrisa más dulce de la noche',
      descripcion: 'La calabaza que todos quieren recibir: chocolate con una sonrisa tallada.',
      video: 'assets/video/celebra/halloween.mp4',
      poster: 'assets/img/poster/halloween.jpg',
      color: '#ff7a1a'
    },
    {
      id: 'navidad',
      numero: '06',
      nombre: 'Navidad',
      fecha: '25 de diciembre',
      producto: 'Muñeco de Jengibre',
      linea: 'El abrazo navideño',
      descripcion: 'El cierre del año en chocolate y masmelos: un muñeco que se siente como hogar.',
      video: 'assets/video/celebra/navidad.mp4',
      poster: 'assets/img/poster/navidad.jpg',
      color: '#57c07d'
    }
  ],

  // ---------- CIERRE DE LA COLECCIÓN ----------
  cierreColeccion: {
    video: 'assets/video/celebra/cierre.mp4',
    poster: 'assets/img/poster/cierre.jpg'
  },

  // ---------- EQUIPO (reparto transformado) ----------
  equipo: [
    { nombre: 'Laura',   celeb: 'Pascua',           foto: 'assets/img/equipo/laura.jpg'   },
    { nombre: 'Mafe',    celeb: 'Día de la Madre y del Padre', foto: 'assets/img/equipo/mafe.jpg' },
    { nombre: 'Mariana', celeb: 'Amor y Amistad',   foto: 'assets/img/equipo/mariana.jpg' },
    { nombre: 'David',   celeb: 'Halloween',        foto: 'assets/img/equipo/david.jpg'   },
    { nombre: 'Camilo',  celeb: 'Navidad',          foto: 'assets/img/equipo/camilo.jpg'  }
  ],

  // ---------- ESCENAS ELIMINADAS ----------
  // comparaciones: antes = frame de la toma real / despues = retrato transformado con IA
  comparaciones: [
    {
      nombre: 'Laura', celeb: 'Pascua',
      antes: 'assets/img/bts/antes-laura.jpg?v=2',
      despues: 'assets/img/equipo/laura.jpg',
      nota: 'Del patio con uniforme al jardín en primavera.'
    },
    {
      nombre: 'Mafe', celeb: 'Día de la Madre y del Padre',
      antes: 'assets/img/bts/antes-mafe.jpg?v=2',
      despues: 'assets/img/equipo/mafe.jpg',
      nota: 'Doble jornada: rosa y corbata el mismo día.'
    },
    {
      nombre: 'Mariana', celeb: 'Amor y Amistad',
      antes: 'assets/img/bts/antes-mariana.jpg?v=2',
      despues: 'assets/img/equipo/mariana.jpg',
      nota: 'El gesto de la toma real terminó dentro del comercial.'
    },
    {
      nombre: 'David', celeb: 'Halloween',
      antes: 'assets/img/bts/antes-david.jpg?v=2',
      despues: 'assets/img/equipo/david.jpg',
      nota: 'La capa la pone la IA; la actitud venía de antes.'
    },
    {
      nombre: 'Camilo', celeb: 'Navidad',
      antes: 'assets/img/bts/antes-camilo.jpg?v=2',
      despues: 'assets/img/equipo/camilo.jpg',
      nota: 'De la grada del patio al árbol de Navidad.'
    }
  ],

  // tomas reales que sobrevivieron — solo imágenes, sin video
  tomas: [
    {
      titulo: 'Toma 01 — Pascua, ensayo en el patio',
      persona: 'Laura',
      imagenes: ['assets/img/bts/toma-laura-1.jpg', 'assets/img/bts/toma-laura-2.jpg']
    },
    {
      titulo: 'Toma 02 — Madre y Padre, doble jornada',
      persona: 'Mafe',
      imagenes: ['assets/img/bts/toma-mafe-1.jpg', 'assets/img/bts/toma-mafe-2.jpg']
    },
    {
      titulo: 'Toma 03 — Amor y Amistad, ensayo con flor',
      persona: 'Mariana',
      imagenes: ['assets/img/bts/toma-mariana-1.jpg', 'assets/img/bts/toma-mariana-2.jpg']
    },
    {
      titulo: 'Toma 04 — Halloween, pausa dramática',
      persona: 'David',
      imagenes: ['assets/img/bts/toma-david-1.jpg', 'assets/img/bts/toma-david-2.jpg']
    },
    {
      titulo: 'Toma 05 — Navidad, espera eterna',
      persona: 'Camilo',
      imagenes: ['assets/img/bts/toma-camilo-1.jpg', 'assets/img/bts/toma-camilo-2.jpg']
    }
  ],

  // contactos: fotos originales de cada integrante (nombradas por Cami) + su transformación IA
  contactos: [
    { src: 'assets/img/bts/raw-david.jpg?v=2', pie: 'Original — David' },
    { src: 'assets/img/bts/toma-david-vampiro.jpg?v=2', pie: 'Transformada — David', transformada: true },
    { src: 'assets/img/bts/raw-laura-1.jpg', pie: 'Original — Laura' },
    { src: 'assets/img/bts/toma-laura-pascua.jpg?v=2', pie: 'Transformada — Laura', transformada: true },
    { src: 'assets/img/bts/raw-mariana.jpg?v=2', pie: 'Original — Mariana' },
    { src: 'assets/img/bts/toma-mariana-amor.jpg?v=2', pie: 'Transformada — Mariana', transformada: true },
    { src: 'assets/img/bts/raw-mafe.jpg?v=2', pie: 'Original — Mafe' },
    { src: 'assets/img/bts/toma-mafe-doble.jpg?v=2', pie: 'Transformada — Mafe', transformada: true },
    { src: 'assets/img/bts/raw-camilo.jpg?v=2', pie: 'Original — Camilo' },
    { src: 'assets/img/bts/toma-camilo-navidad.jpg?v=2', pie: 'Transformada — Camilo', transformada: true },
    { src: 'assets/img/bts/raw-laura-2.jpg', pie: 'Original — Laura' }
  ],

  // capturas del proceso de edición
  proceso: [
    { img: 'assets/img/bts/proceso-editor-1.jpg', pie: 'El cuarto de edición — montaje del comercial' },
    { img: 'assets/img/bts/proceso-editor-2.jpg', pie: 'Ajuste fino de escenas' },
    { img: 'assets/img/bts/proceso-medios.jpg',   pie: 'El banco de tomas: todo lo que se rodó' }
  ]
};

