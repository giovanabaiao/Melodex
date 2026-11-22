// Reproductor global de Melodex.
import { mostrarToast } from './toast.js';
import { escapeHTML } from './item.js';
import { SVG_PLAY, SVG_PAUSE, SVG_ECUALIZADOR } from './iconos.js';

const API_BASE_URL = 'https://api.audius.co/v1';
const APP_NAME = 'Melodex';
const CLAVE_VOLUMEN = 'melodex-volumen';

const audio = new Audio();
// Cambiado de 'none' a 'metadata': el navegador hace la petición al asignar
// src (siguiendo el redirect de Audius), pero sin descargar todo el audio.
audio.preload = 'metadata';

// Si una canción no empieza a sonar en este tiempo, se prueba otra vía.
const ESPERA_POR_INTENTO_MS = 8000;
// Tiempo máximo de la petición que resuelve la URL real del audio.
const ESPERA_FETCH_MS = 5000;
// Tras fallar, la barra se queda un momento visible (para leer el aviso) y se quita sola.
const RETARDO_CIERRE_MS = 2500;

let actual = null;
let arrastrando = false;

// Control de intentos de reproducción de la canción en curso.
let generacion = 0;        // se incrementa con cada canción nueva o al cerrar
let intento = 0;           // 0 = URL directa, 1 = no_redirect, 2 = host alternativo
let temporizadorEspera = null;
let temporizadorCierre = null;

let barra, imgPortada, txtTitulo, txtArtista, btnPlay, rango, txtActual, txtTotal, volumen;

function formatearTiempo(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const min = Math.floor(segundos / 60);
  const seg = String(Math.floor(segundos % 60)).padStart(2, '0');
  return `${min}:${seg}`;
}

function crearBarra() {
  barra = document.createElement('div');
  barra.id = 'reproductor';
  barra.className = 'reproductor oculto';
  barra.setAttribute('role', 'region');
  barra.setAttribute('aria-label', 'Reproductor de música');

  barra.innerHTML = `
    <div class="rep-cancion">
      <img id="rep-portada" alt="" width="48" height="48">
      <div class="rep-textos">
        <strong id="rep-titulo"></strong>
        <span id="rep-artista"></span>
      </div>
      ${SVG_ECUALIZADOR}
    </div>

    <div class="rep-centro">
      <button type="button" id="rep-play" class="rep-boton-play" aria-label="Reproducir">
        ${SVG_PLAY}${SVG_PAUSE}
      </button>
      <span id="rep-actual" class="rep-tiempo">0:00</span>
      <input type="range" id="rep-progreso" min="0" max="100" step="0.1" value="0" aria-label="Progreso">
      <span id="rep-total" class="rep-tiempo">0:00</span>
    </div>

    <div class="rep-lado">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>
      </svg>
      <input type="range" id="rep-volumen" min="0" max="1" step="0.01" value="0.8" aria-label="Volumen">
      <button type="button" id="rep-cerrar" class="rep-cerrar" aria-label="Cerrar reproductor">✕</button>
    </div>`;

  document.body.appendChild(barra);

  imgPortada = barra.querySelector('#rep-portada');
  txtTitulo = barra.querySelector('#rep-titulo');
  txtArtista = barra.querySelector('#rep-artista');
  btnPlay = barra.querySelector('#rep-play');
  rango = barra.querySelector('#rep-progreso');
  txtActual = barra.querySelector('#rep-actual');
  txtTotal = barra.querySelector('#rep-total');
  volumen = barra.querySelector('#rep-volumen');
}

function pintarRango(input) {
  const max = Number(input.max) || 1;
  const pct = (Number(input.value) / max) * 100;
  input.style.setProperty('--relleno', `${pct}%`);
}

function sincronizarBotones() {
  const sonando = actual !== null && !audio.paused;

  document.querySelectorAll('.btn-play').forEach((boton) => {
    const esActual = actual !== null && boton.dataset.playId === actual.id;
    const activo = esActual && sonando;
    boton.classList.toggle('sonando', activo);
    boton.setAttribute('aria-label', activo ? 'Pausar' : 'Reproducir');
    const tarjeta = boton.closest('.item-card, .fila-cancion');
    if (tarjeta) tarjeta.classList.toggle('reproduciendo', esActual);
  });

  if (barra) {
    barra.classList.toggle('sonando', sonando);
    btnPlay.classList.toggle('sonando', sonando);
    btnPlay.setAttribute('aria-label', sonando ? 'Pausar' : 'Reproducir');
  }
}

function mostrarBarra() {
  barra.classList.remove('oculto');
  document.body.classList.add('con-reproductor');
}

function limpiarTemporizadores() {
  clearTimeout(temporizadorEspera);
  clearTimeout(temporizadorCierre);
  temporizadorEspera = null;
  temporizadorCierre = null;
}

function cerrarReproductor() {
  generacion++;
  limpiarTemporizadores();
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  actual = null;
  barra.classList.remove('cargando', 'error');
  barra.classList.add('oculto');
  document.body.classList.remove('con-reproductor');
  sincronizarBotones();
}

function urlDirecta(id) {
  return `${API_BASE_URL}/tracks/${encodeURIComponent(id)}/stream?app_name=${APP_NAME}`;
}

// ── Resolución de la URL del audio ───────────────────────────
// Audius responde a /stream con un redirect al servidor de contenido. Si ese
// servidor está caído o lento, el <audio> se queda esperando sin dar error.
// Por eso se piden URLs alternativas con no_redirect=true (devuelve JSON).

async function fetchConTiempo(url) {
  const control = new AbortController();
  const aborto = setTimeout(() => control.abort(), ESPERA_FETCH_MS);
  try {
    return await fetch(url, { signal: control.signal });
  } finally {
    clearTimeout(aborto);
  }
}

async function urlDesdeJSON(url) {
  const respuesta = await fetchConTiempo(url);
  if (!respuesta.ok) return null;
  const json = await respuesta.json();
  return typeof json.data === 'string' && /^https?:\/\//i.test(json.data) ? json.data : null;
}

async function resolverURL(id, intentoActual) {
  try {
    if (intentoActual === 1) {
      return await urlDesdeJSON(`${urlDirecta(id)}&no_redirect=true`);
    }

    // intentoActual === 2: pide la lista de hosts y prueba uno distinto.
    const hosts = await fetchConTiempo('https://api.audius.co');
    if (!hosts.ok) return null;
    const lista = (await hosts.json()).data;
    if (!Array.isArray(lista) || lista.length === 0) return null;

    const host = lista[Math.floor(Math.random() * lista.length)];
    return await urlDesdeJSON(
      `${host}/v1/tracks/${encodeURIComponent(id)}/stream?app_name=${APP_NAME}&no_redirect=true`
    );
  } catch (error) {
    console.warn(`[reproductor] intento ${intentoActual} falló:`, error.name);
    return null;
  }
}

async function intentarPlay() {
  try {
    await audio.play();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // No es un fallo de la canción: el navegador pide una pulsación del usuario.
      clearTimeout(temporizadorEspera);
      barra.classList.remove('cargando');
      mostrarToast('El navegador bloqueó la reproducción. Pulsa play otra vez.', 'error');
    } else if (error.name !== 'AbortError' && error.name !== 'NotSupportedError') {
      console.error('[reproductor] play() falló:', error);
    }
  }
}

// Se llama cuando todas las vías han fallado: avisa y quita la barra sola.
function darPorFallida(idEnCurso) {
  clearTimeout(temporizadorEspera);
  barra.classList.remove('cargando');
  barra.classList.add('error');
  txtArtista.textContent = 'No se puede reproducir esta canción';
  mostrarToast('Esta canción no se puede reproducir (puede tener acceso restringido).', 'error');
  sincronizarBotones();

  temporizadorCierre = setTimeout(() => {
    if (actual && actual.id === idEnCurso) cerrarReproductor();
  }, RETARDO_CIERRE_MS);
}

// Pasa a la siguiente vía de reproducción; si no quedan, cierra el reproductor.
async function probarSiguiente(miGeneracion) {
  if (miGeneracion !== generacion || !actual) return;

  clearTimeout(temporizadorEspera);
  const idEnCurso = actual.id;
  intento++;

  if (intento > 2) {
    darPorFallida(idEnCurso);
    return;
  }

  const url = await resolverURL(idEnCurso, intento);
  if (miGeneracion !== generacion) return; // el usuario cambió de canción o cerró

  if (!url || url === audio.src) {
    probarSiguiente(miGeneracion);
    return;
  }

  empezarEspera(miGeneracion);
  audio.src = url;
  await intentarPlay();
}

// Si no suena en ESPERA_POR_INTENTO_MS, se salta a la siguiente vía.
function empezarEspera(miGeneracion) {
  clearTimeout(temporizadorEspera);
  temporizadorEspera = setTimeout(() => {
    console.warn('[reproductor] tiempo de espera agotado en el intento', intento);
    probarSiguiente(miGeneracion);
  }, ESPERA_POR_INTENTO_MS);
}

async function reproducir(datos) {
  if (actual && actual.id === datos.id) {
    if (audio.paused) await intentarPlay();
    else audio.pause();
    return;
  }

  limpiarTemporizadores();
  generacion++;
  const miGeneracion = generacion;
  intento = 0;

  actual = datos;
  imgPortada.src = datos.imagen;
  imgPortada.alt = `Portada de ${datos.titulo}`;
  txtTitulo.textContent = datos.titulo;
  txtArtista.textContent = datos.artista;
  rango.value = 0;
  pintarRango(rango);
  txtActual.textContent = '0:00';
  txtTotal.textContent = '0:00';
  barra.classList.remove('error');
  barra.classList.add('cargando');
  mostrarBarra();

  // Se asigna la URL directa primero para preservar la activación del usuario.
  empezarEspera(miGeneracion);
  audio.src = urlDirecta(datos.id);
  sincronizarBotones();
  await intentarPlay();
  sincronizarBotones();
}

function alFallarAudio() {
  if (!actual) return; // error provocado por cerrar el reproductor
  if (audio.error) {
    console.warn('[reproductor] error de audio, código:', audio.error.code);
  }
  probarSiguiente(generacion);
}

// El audio ya suena: se cancela la espera y se quita el estado de carga.
function alEmpezar() {
  clearTimeout(temporizadorEspera);
  barra.classList.remove('cargando');
}

export function inicializarReproductor() {
  crearBarra();

  // Restaurar volumen respetando el 0
  const guardado = localStorage.getItem(CLAVE_VOLUMEN);
  const vol = guardado !== null ? Number(guardado) : NaN;
  audio.volume = Number.isFinite(vol) && vol >= 0 && vol <= 1 ? vol : 0.8;
  volumen.value = audio.volume;
  pintarRango(volumen);

  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.btn-play');
    if (!boton) return;
    evento.stopPropagation();
    reproducir({
      id: boton.dataset.playId,
      titulo: boton.dataset.playTitulo ?? 'Sin título',
      artista: boton.dataset.playArtista ?? '',
      imagen: boton.dataset.playImagen ?? '',
    });
  }, true);

  btnPlay.addEventListener('click', async () => {
    if (!actual) return;
    if (audio.paused) await intentarPlay();
    else audio.pause();
  });

  barra.querySelector('#rep-cerrar').addEventListener('click', cerrarReproductor);

  rango.addEventListener('input', () => {
    arrastrando = true;
    pintarRango(rango);
    if (audio.duration) {
      txtActual.textContent = formatearTiempo((Number(rango.value) / 100) * audio.duration);
    }
  });

  rango.addEventListener('change', () => {
    if (audio.duration) {
      audio.currentTime = (Number(rango.value) / 100) * audio.duration;
    }
    arrastrando = false;
  });

  volumen.addEventListener('input', () => {
    audio.volume = Number(volumen.value);
    localStorage.setItem(CLAVE_VOLUMEN, String(audio.volume));
    pintarRango(volumen);
  });

  audio.addEventListener('timeupdate', () => {
    if (arrastrando || !audio.duration) return;
    rango.value = (audio.currentTime / audio.duration) * 100;
    pintarRango(rango);
    txtActual.textContent = formatearTiempo(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    txtTotal.textContent = formatearTiempo(audio.duration);
  });

  audio.addEventListener('play', sincronizarBotones);
  audio.addEventListener('pause', sincronizarBotones);

  audio.addEventListener('ended', () => {
    rango.value = 0;
    pintarRango(rango);
    txtActual.textContent = '0:00';
    sincronizarBotones();
  });

  audio.addEventListener('error', alFallarAudio);
  audio.addEventListener('playing', alEmpezar);

  document.addEventListener('keydown', (evento) => {
    if (evento.code !== 'Space' || !actual) return;
    const destino = evento.target;
    const escribiendo = destino.matches('input, textarea, select, button, [contenteditable]');
    if (escribiendo) return;
    evento.preventDefault();
    btnPlay.click();
  });

  new MutationObserver(sincronizarBotones).observe(document.querySelector('main'), {
    childList: true,
    subtree: true,
  });
}