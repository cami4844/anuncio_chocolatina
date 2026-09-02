# CHACOQUIRA — Guía de edición

Todo el contenido del sitio vive en **dos archivos JavaScript**. No hace falta tocar
el HTML para cambiar textos, videos, imágenes o modelos.

## Dónde está cada cosa

| Qué quieres cambiar | Archivo | Dónde |
|---|---|---|
| Eslogan, descriptor, nombre | `config.js` | bloque `marca` |
| URL de destino del QR | `config.js` | `qr.urlDestino` |
| Redes sociales | `config.js` | bloque `redes` |
| Ruta del video / audio / hero | `config.js` | bloque `media` |
| Modelos 3D y sus textos | `config.js` | bloque `modelos` |
| Las 6 celebraciones (nombre, fecha, producto, texto, video, color) | `js/datos.js` | `celebraciones` |
| Equipo (nombres, fotos, celebración) | `js/datos.js` | `equipo` |
| Comparaciones antes / después | `js/datos.js` | `comparaciones` |
| Tomas reales del patio (videos) | `js/datos.js` | `tomas` |
| Contactos originales y capturas de edición | `js/datos.js` | `contactos` y `proceso` |

## Cómo abrir el sitio

- **Doble clic a `CHACOQUIRA-WEB.bat`** — levanta el servidor local y abre
  `http://127.0.0.1:8123`. Es la forma recomendada (activa la vitrina 3D).
- Abrir `index.html` directo también funciona para todo, excepto la carga del
  modelo 3D (el navegador bloquea la descarga de archivos .glb sin servidor;
  el sitio lo detecta y lo explica dentro de la propia vitrina).

## QR del empaque

Cuando exista la URL definitiva:
1. Escribe la URL en `config.js` → `qr.urlDestino`.
2. Genera el QR físico apuntando exactamente a esa URL.
3. Publica esta carpeta completa (con sus subcarpetas) en ese dominio.

## Estructura

```
chacoquira-web/
  index.html            <- estructura de la experiencia
  config.js             <- configuración y marca
  CHACOQUIRA-WEB.bat    <- iniciador local
  css/                  <- estilos (base, secciones, responsive, fuentes)
  js/                   <- main, scroll, video, models3d, bts, datos
  assets/
    img/                <- logos, equipo, BTS, posters
    video/              <- comercial, hero, celebraciones, BTS
    audio/              <- spot de 70 s
    modelo/             <- GLB comprimidos
    lib/                <- three.js, GSAP, GLTFLoader, MeshoptDecoder
    fonts/              <- Fraunces + Outfit (locales)
```

## Notas técnicas

- Los modelos .glb están comprimidos con gltfpack (meshopt + WebP):
  54 MB → 11 MB cada uno. Se cargan solo cuando la vitrina entra en pantalla.
- El comercial se sirve en 720p H.264 (~11 MB, fue 160 MB); el original queda
  intacto en la carpeta `anuncio`.
- Videos de celebraciones y BTS se cargan perezosamente: solo cuando su
  sección se acerca a la vista.
- Si algún nombre del equipo quedó asociado a otra celebración, corrígelo en
  `js/datos.js` (bloques `equipo`, `comparaciones` y `tomas`).
