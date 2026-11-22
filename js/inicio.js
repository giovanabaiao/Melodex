// Panel de inicio: resumen de la colección (tarjetas de estadísticas) y últimas canciones guardadas.
import { ColeccionStorage } from './coleccionStorage.js';
import { Item, escapeHTML, botonPlayHTML } from './item.js';

// Cinco estrellas rellenas según la media (0-5).
function estrellasSVG(media) {
  const ruta = 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.7 1.1-5.9L3.5 9.7l5.9-.8z';
  let html = '<svg viewBox="0 0 120 24" class="visual-estrellas" aria-hidden="true">';

  for (let i = 0; i < 5; i++) {
    const relleno = Math.max(0, Math.min(1, media - i)); // 0..1 por estrella
    html += `
      <g transform="translate(${i * 24},0)">
        <defs><clipPath id="est-${i}"><rect x="0" y="0" width="${24 * relleno}" height="24"/></clipPath></defs>
        <path d="${ruta}" class="estrella-fondo"/>
        <path d="${ruta}" class="estrella-activa" clip-path="url(#est-${i})"/>
      </g>`;
  }
  return html + '</svg>';
}

// Barras con las valoraciones de las últimas canciones guardadas.
function barrasSVG(valoraciones) {
  const datos = valoraciones.length ? valoraciones : [0];
  const ancho = 100 / Math.max(datos.length, 6);
  const barras = datos.map((v, i) => {
    const alto = (v / 5) * 44;
    const ultima = i === datos.length - 1;
    return `<rect x="${i * ancho + 2}" y="${52 - alto}" width="${ancho - 4}" height="${Math.max(alto, 2)}" rx="2"
                  class="${ultima ? 'barra-viva' : 'barra-tenue'}"/>`;
  }).join('');

  return `<svg viewBox="0 0 100 56" class="visual-barras" aria-hidden="true">${barras}
          <line x1="0" y1="52" x2="100" y2="52" class="linea-base"/></svg>`;
}

// Anillo con las proporciones por género (los 4 más habituales).
function anilloSVG(conteo, total) {
  const colores = ['var(--color-principal)', 'var(--color-violeta)', 'var(--color-azul)', 'var(--color-naranja)'];
  const radio = 16;
  const circunferencia = 2 * Math.PI * radio;
  const partes = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 4);

  let acumulado = 0;
  const arcos = partes.map(([, n], i) => {
    const largo = (n / total) * circunferencia;
    const arco = `<circle cx="20" cy="20" r="${radio}" fill="none" stroke="${colores[i]}" stroke-width="6"
                          stroke-dasharray="${largo} ${circunferencia - largo}"
                          stroke-dashoffset="${-acumulado}" transform="rotate(-90 20 20)"/>`;
    acumulado += largo;
    return arco;
  }).join('');

  return `<svg viewBox="0 0 40 40" class="visual-anillo" aria-hidden="true">
            <circle cx="20" cy="20" r="${radio}" fill="none" class="anillo-fondo" stroke-width="6"/>${arcos}
          </svg>`;
}

function filaCancion(item) {
  const play = botonPlayHTML({
    id: item.id,
    titulo: item.title,
    artista: item.nombreArtista,
    imagen: item.getImagen('150x150'),
  }, 'btn-play-mini');

  const nota = item.valoracion
    ? `<span class="fila-nota">★ ${item.valoracion}</span>`
    : '';

  return `
    <li class="fila-cancion">
      <div class="item-portada mini">
        <img src="${escapeHTML(item.getImagen('150x150'))}" alt="" loading="lazy">
        ${play}
      </div>
      <div class="fila-textos">
        <strong>${escapeHTML(item.title)}</strong>
        <span>${escapeHTML(item.nombreArtista)}</span>
      </div>
      ${nota}
    </li>`;
}

export function inicializarInicio() {
  const total = document.getElementById('inicio-total');
  if (!total) return; // la plantilla aún no está cargada

  const canciones = ColeccionStorage.obtenerTodos();
  const items = canciones.map((c) => Item.fromStorageObject(c));
  const valoradas = items.filter((i) => Number.isInteger(i.valoracion) && i.valoracion >= 1 && i.valoracion <= 5);

  // ── Total de canciones ──
  total.textContent = items.length;
  document.getElementById('inicio-total-visual').innerHTML =
    barrasSVG(valoradas.slice(-8).map((i) => i.valoracion));

  // ── Valoración media ──
  const media = valoradas.length
    ? valoradas.reduce((s, i) => s + i.valoracion, 0) / valoradas.length
    : 0;
  document.getElementById('inicio-media').textContent = media.toFixed(1);
  document.getElementById('inicio-media-visual').innerHTML = estrellasSVG(media);

  // ── Género favorito ──
  const conteo = items.reduce((acc, i) => {
    const g = i.genre || 'Sin género';
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('inicio-genero').textContent = top ? top[0] : '—';
  document.getElementById('inicio-genero-sub').textContent = top
    ? `${top[1]} ${top[1] === 1 ? 'canción' : 'canciones'}`
    : 'guarda canciones para verlo';
  document.getElementById('inicio-genero-visual').innerHTML = top
    ? anilloSVG(conteo, items.length)
    : '<svg viewBox="0 0 40 40" class="visual-anillo" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" class="anillo-fondo" stroke-width="6"/></svg>';

  // ── Últimas canciones guardadas ──
  const recientes = [...items]
    .sort((a, b) => new Date(b.fechaGuardado) - new Date(a.fechaGuardado))
    .slice(0, 4);

  const lista = document.getElementById('inicio-recientes');
  lista.innerHTML = recientes.length
    ? `<ul class="lista-filas">${recientes.map(filaCancion).join('')}</ul>`
    : '<p class="vacio">Aún no hay canciones. Ve al Buscador y guarda la primera.</p>';
}
