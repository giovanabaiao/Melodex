// Convierte cada <select> nativo en un desplegable propio con el diseño de la app.
// El <select> original se conserva (oculto) y se mantiene sincronizado, así que el resto
// del código sigue leyendo .value y escuchando "change" como siempre.
import { escapeHTML } from './item.js';

const CHEVRON =
  '<svg class="select-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

let abierto = null; // instancia con la lista desplegada ahora mismo

function cerrarAbierto() {
  if (abierto) abierto.cerrar();
}

function mejorar(select) {
  select.dataset.mejorado = '1';

  const envoltorio = document.createElement('div');
  envoltorio.className = 'select-personalizado';

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'select-boton';
  boton.setAttribute('aria-haspopup', 'listbox');
  boton.setAttribute('aria-expanded', 'false');

  const lista = document.createElement('ul');
  lista.className = 'select-lista';
  lista.setAttribute('role', 'listbox');

  // El select sigue en el DOM pero invisible.
  select.parentNode.insertBefore(envoltorio, select);
  envoltorio.append(select, boton);
  select.classList.add('select-nativo');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const etiqueta = select.id ? document.querySelector(`label[for="${CSS.escape(select.id)}"]`) : null;
  if (etiqueta) {
    boton.setAttribute('aria-label', etiqueta.textContent.trim());
    etiqueta.addEventListener('click', () => boton.focus());
  }

  let indiceActivo = -1;

  function pintar() {
    const opciones = [...select.options];
    const elegida = select.selectedOptions[0] ?? opciones[0];

    boton.innerHTML = `<span class="select-texto">${escapeHTML(elegida?.textContent ?? '')}</span>${CHEVRON}`;
    boton.disabled = select.disabled;

    lista.innerHTML = opciones
      .map((op, i) => `
        <li role="option" data-indice="${i}" aria-selected="${op === elegida}"
            class="${op === elegida ? 'elegida' : ''}">${escapeHTML(op.textContent)}</li>`)
      .join('');
  }

  function marcarActivo(indice) {
    indiceActivo = indice;
    lista.querySelectorAll('li').forEach((li, i) => li.classList.toggle('activa', i === indice));
    lista.querySelector('li.activa')?.scrollIntoView({ block: 'nearest' });
  }

  function colocar() {
    // La lista vive en <body> con position:fixed para que ningún panel con scroll la recorte.
    const r = boton.getBoundingClientRect();
    const alto = Math.min(lista.scrollHeight, 260);
    const abajo = window.innerHeight - r.bottom;
    const haciaArriba = abajo < alto + 16 && r.top > abajo;

    lista.style.width = `${r.width}px`;
    lista.style.left = `${r.left}px`;
    lista.style.top = haciaArriba ? `${r.top - alto - 6}px` : `${r.bottom + 6}px`;
  }

  const instancia = {
    cerrar() {
      lista.classList.remove('visible');
      lista.remove();
      boton.setAttribute('aria-expanded', 'false');
      envoltorio.classList.remove('abierto');
      if (abierto === instancia) abierto = null;
    },
    abrir() {
      if (select.disabled) return;
      cerrarAbierto();
      pintar();
      document.body.appendChild(lista);
      colocar();
      requestAnimationFrame(() => lista.classList.add('visible'));
      boton.setAttribute('aria-expanded', 'true');
      envoltorio.classList.add('abierto');
      abierto = instancia;
      marcarActivo(select.selectedIndex);
    },
  };

  function elegir(indice) {
    if (indice < 0 || indice >= select.options.length) return;

    select.selectedIndex = indice;
    // Se avisa igual que lo haría el select nativo.
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));

    pintar();
    instancia.cerrar();
    boton.focus();
  }

  boton.addEventListener('click', () => {
    if (abierto === instancia) instancia.cerrar();
    else instancia.abrir();
  });

  lista.addEventListener('click', (evento) => {
    const li = evento.target.closest('li[data-indice]');
    if (li) elegir(Number(li.dataset.indice));
  });

  lista.addEventListener('mousemove', (evento) => {
    const li = evento.target.closest('li[data-indice]');
    if (li) marcarActivo(Number(li.dataset.indice));
  });

  boton.addEventListener('keydown', (evento) => {
    const total = select.options.length;
    const estaAbierto = abierto === instancia;

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!estaAbierto) return instancia.abrir();
      const paso = evento.key === 'ArrowDown' ? 1 : -1;
      marcarActivo((indiceActivo + paso + total) % total);
    } else if ((evento.key === 'Enter' || evento.key === ' ') && estaAbierto) {
      evento.preventDefault();
      elegir(indiceActivo);
    } else if (evento.key === 'Escape' && estaAbierto) {
      evento.stopPropagation();
      instancia.cerrar();
    } else if (evento.key === 'Tab' && estaAbierto) {
      instancia.cerrar();
    }
  });

  // Si el código cambia las opciones o desactiva el select, el desplegable se actualiza.
  new MutationObserver(pintar).observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled'],
  });
  select.addEventListener('change', pintar);

  pintar();
}

export function inicializarSelects() {
  const procesar = () => {
    document.querySelectorAll('select:not([data-mejorado])').forEach(mejorar);
  };

  procesar();

  // Las secciones y los detalles se crean dinámicamente: se mejoran al aparecer.
  new MutationObserver(procesar).observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', (evento) => {
    if (!abierto) return;
    if (evento.target.closest('.select-lista, .select-personalizado')) return;
    cerrarAbierto();
  });

  window.addEventListener('resize', cerrarAbierto);
  window.addEventListener('scroll', (evento) => {
    // El scroll interno de la propia lista no debe cerrarla.
    if (evento.target instanceof Element && evento.target.closest('.select-lista')) return;
    cerrarAbierto();
  }, true);
}
