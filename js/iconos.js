// Iconos SVG propios de Melodex, todos con temática musical.
// Se dibujan con trazo (stroke="currentColor"), así heredan el color del tema.
//
// Uso en las plantillas HTML:
//   <h2 data-icono="buscador">Buscador</h2>
// decorarIconos() inserta el SVG justo antes del texto del título.

const envolver = (contenido) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${contenido}</svg>`;

// Capa de color suave detrás del trazo: da aspecto "duotono" a los iconos.
const suave = (d, extra = '') =>
  `<path d="${d}" fill="currentColor" fill-opacity=".16" stroke="none" ${extra}/>`;
const relleno = '<g fill="currentColor" fill-opacity=".16" stroke="none">';

// tono = color del icono y de la cajita que lo rodea (ver .icono-titulo en base.css)
export const ICONOS = {
  // Disco de vinilo con surco y etiqueta
  inicio: {
    tono: 'verde',
    svg: envolver(
      `${relleno}<circle cx="12" cy="12" r="9.2"/></g>` +
      '<circle cx="12" cy="12" r="9.2"/>' +
      '<path d="M12 6.4a5.6 5.6 0 0 1 5.6 5.6" opacity=".55"/>' +
      '<circle cx="12" cy="12" r="2.6" fill="currentColor" fill-opacity=".35"/>' +
      '<circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none"/>'
    ),
  },
  // Lupa con onda de sonido
  buscador: {
    tono: 'azul',
    svg: envolver(
      `${relleno}<circle cx="10.5" cy="10.5" r="7"/></g>` +
      '<circle cx="10.5" cy="10.5" r="7"/><path d="M15.7 15.7L21 21" stroke-width="2.2"/>' +
      '<path d="M6.8 10.5h1.5l1.2-2.6 1.8 5 1.3-2.4h1.4" stroke-width="1.5"/>'
    ),
  },
  // Discos en una estantería
  coleccion: {
    tono: 'violeta',
    svg: envolver(
      `${relleno}<rect x="3" y="5" width="5" height="15" rx="1.4"/><rect x="9.6" y="3" width="5" height="17" rx="1.4"/>` +
      '<path d="M16.6 7l3.6-1 3 12.8-3.8 1z"/></g>' +
      '<rect x="3" y="5" width="5" height="15" rx="1.4"/><rect x="9.6" y="3" width="5" height="17" rx="1.4"/>' +
      '<path d="M16.6 7l3.6-1 3 12.8-3.8 1z"/><path d="M3 8.5h5M9.6 7h5" opacity=".5"/>'
    ),
  },
  // Mesa de mezclas con deslizadores
  gestion: {
    tono: 'naranja',
    svg: envolver(
      '<path d="M5.5 3.5v17M12 3.5v17M18.5 3.5v17" opacity=".45"/>' +
      `${relleno}<rect x="3" y="6.5" width="5" height="4" rx="1.4"/><rect x="9.5" y="13.5" width="5" height="4" rx="1.4"/><rect x="16" y="8.5" width="5" height="4" rx="1.4"/></g>` +
      '<rect x="3" y="6.5" width="5" height="4" rx="1.4"/><rect x="9.5" y="13.5" width="5" height="4" rx="1.4"/><rect x="16" y="8.5" width="5" height="4" rx="1.4"/>'
    ),
  },
  // Ecualizador
  estadisticas: {
    tono: 'rosa',
    svg: envolver(
      `${relleno}<rect x="3" y="12" width="3.8" height="8.5" rx="1.4"/><rect x="8.4" y="6" width="3.8" height="14.5" rx="1.4"/>` +
      '<rect x="13.8" y="9" width="3.8" height="11.5" rx="1.4"/><rect x="19.2" y="3.5" width="2.3" height="17" rx="1.1"/></g>' +
      '<rect x="3" y="12" width="3.8" height="8.5" rx="1.4"/><rect x="8.4" y="6" width="3.8" height="14.5" rx="1.4"/>' +
      '<rect x="13.8" y="9" width="3.8" height="11.5" rx="1.4"/><path d="M20.35 3.5v17"/>'
    ),
  },
  // Dial de volumen
  ajustes: {
    tono: 'gris',
    svg: envolver(
      `${relleno}<circle cx="12" cy="13" r="6"/></g>` +
      '<circle cx="12" cy="13" r="6"/><path d="M12 13l3-3.2" stroke-width="2"/>' +
      '<path d="M4.4 19a9.6 9.6 0 1 1 15.2 0" opacity=".45"/>'
    ),
  },
  // Auriculares
  resultados: {
    tono: 'azul',
    svg: envolver(
      '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/>' +
      `${relleno}<rect x="3" y="13.5" width="4.6" height="7.5" rx="2"/><rect x="16.4" y="13.5" width="4.6" height="7.5" rx="2"/></g>` +
      '<rect x="3" y="13.5" width="4.6" height="7.5" rx="2"/><rect x="16.4" y="13.5" width="4.6" height="7.5" rx="2"/>'
    ),
  },
  // Nota musical
  nota: {
    tono: 'violeta',
    svg: envolver(
      `${relleno}<circle cx="6.5" cy="18" r="2.8"/><circle cx="17.5" cy="16" r="2.8"/></g>` +
      '<path d="M9.3 18V6.2l11-2V16"/><circle cx="6.5" cy="18" r="2.8"/><circle cx="17.5" cy="16" r="2.8"/>'
    ),
  },
  // Corazón (canciones guardadas)
  guardadas: {
    tono: 'rosa',
    svg: envolver(
      suave('M12 20.5s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z') +
      '<path d="M12 20.5s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z"/>'
    ),
  },
  // Embudo (filtros)
  filtro: {
    tono: 'naranja',
    svg: envolver(
      suave('M3.5 5.5h17L14 13v6l-4 2v-8z') +
      '<path d="M3.5 5.5h17L14 13v6l-4 2v-8z"/>'
    ),
  },
  // Ondas de radio (géneros)
  genero: {
    tono: 'verde',
    svg: envolver(
      '<circle cx="12" cy="12" r="2.2" fill="currentColor" fill-opacity=".35"/>' +
      '<path d="M8 8a5.7 5.7 0 0 0 0 8M16 8a5.7 5.7 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>'
    ),
  },
  // Estrella (valoraciones)
  estrella: {
    tono: 'amarillo',
    svg: envolver(
      suave('M12 3.4l2.7 5.5 6 .9-4.4 4.2 1 6L12 17.2 6.7 20l1-6L3.3 9.8l6-.9z') +
      '<path d="M12 3.4l2.7 5.5 6 .9-4.4 4.2 1 6L12 17.2 6.7 20l1-6L3.3 9.8l6-.9z"/>'
    ),
  },
  // Reloj (últimas canciones)
  reciente: {
    tono: 'azul',
    svg: envolver(
      suave('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z') +
      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>'
    ),
  },
  // Rayo (acciones rápidas)
  rapido: {
    tono: 'naranja',
    svg: envolver(
      suave('M13.5 2.8L4.6 13.6h6.2l-1 7.6 8.9-10.8h-6.2z') +
      '<path d="M13.5 2.8L4.6 13.6h6.2l-1 7.6 8.9-10.8h-6.2z"/>'
    ),
  },
};

// Botones del reproductor (relleno sólido).
export const SVG_PLAY =
  '<svg class="ic-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.9l11-6.8a1 1 0 0 0 0-1.8l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor"/></svg>';
export const SVG_PAUSE =
  '<svg class="ic-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" rx="1.3" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.3" fill="currentColor"/></svg>';

// Ecualizador animado (se mueve solo mientras suena la canción).
export const SVG_ECUALIZADOR =
  '<span class="ecualizador" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

/**
 * Busca elementos con data-icono dentro de "raiz" y les inserta su SVG.
 * - En el menú lateral: icono simple.
 * - En títulos: icono dentro de una cajita de color.
 */
export function decorarIconos(raiz = document) {
  raiz.querySelectorAll('[data-icono]').forEach((el) => {
    if (el.dataset.iconoListo) return; // ya decorado

    const icono = ICONOS[el.dataset.icono];
    if (!icono) return;

    const caja = document.createElement('span');
    const esMenu = el.closest('#menu-principal') !== null;

    caja.className = esMenu ? 'icono-nav' : 'icono-titulo';
    caja.dataset.tono = icono.tono;
    caja.setAttribute('aria-hidden', 'true');
    caja.innerHTML = icono.svg;

    el.prepend(caja);
    el.dataset.iconoListo = '1';
  });
}

/** SVG suelto por nombre (para usarlo dentro de plantillas de texto). */
export function iconoSVG(nombre) {
  return ICONOS[nombre]?.svg ?? '';
}
