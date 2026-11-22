import { inicializarBuscador } from './buscador.js';
import { inicializarAjustes } from './ajustes.js';
import { inicializarGestionColeccion } from './gestionColeccion.js';
import { inicializarColeccion } from './coleccion.js';
import { inicializarEstadisticas } from './estadisticas.js';
import { inicializarInicio } from './inicio.js';
import { inicializarReproductor } from './reproductor.js';
import { decorarIconos } from './iconos.js';
import { inicializarSelects } from './selectPersonalizado.js';


const SECCIONES = [
  'inicio',
  'buscador',
  'coleccion',
  'gestionColeccion',
  'estadisticas',
  'ajustes'
];

const INICIALIZADORES =
{
  inicio: inicializarInicio,
  buscador: inicializarBuscador,
  coleccion: inicializarColeccion,
  gestionColeccion: inicializarGestionColeccion,
  estadisticas: inicializarEstadisticas,
  ajustes: inicializarAjustes
};

async function cargarSeccion(nombre) {
  const contenedor = document.getElementById(`seccion-${nombre}`);

  try {
    const respuesta = await fetch(`templates/${nombre}.html`);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${nombre}`);
    }

    contenedor.innerHTML = await respuesta.text();

    // Inserta el SVG temático junto a cada título con data-icono.
    decorarIconos(contenedor);

    if (INICIALIZADORES[nombre]) {
      INICIALIZADORES[nombre]();
    }
  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar esta sección.</p>';
    console.error(error);
  }
}

let temporizadorCambio = null;

function mostrarSeccion(nombre) {
  const nueva = document.getElementById(`seccion-${nombre}`);
  const anterior = document.querySelector('.seccion.activa, .seccion.saliendo');

  // El menú cambia al instante.
  document
    .querySelectorAll('#menu-principal button')
    .forEach(btn => btn.classList.remove('active'));

  document
    .querySelector(`#menu-principal button[data-seccion="${nombre}"]`)
    ?.classList.add('active');

  // Dirección de la animación según el orden del menú.
  const desde = SECCIONES.indexOf(anterior?.id.replace('seccion-', ''));
  const hasta = SECCIONES.indexOf(nombre);
  const direccion = hasta >= desde ? 'desde-der' : 'desde-izq';

  clearTimeout(temporizadorCambio);

  const entrar = () => {
    document
      .querySelectorAll('.seccion')
      .forEach(sec => sec.classList.remove('activa', 'saliendo', 'desde-der', 'desde-izq'));

    nueva.classList.add('activa', direccion);

    // Actualiza los datos al entrar en estas secciones
    if (nombre === 'estadisticas') {
      inicializarEstadisticas();
    }
    if (nombre === 'inicio') {
      inicializarInicio();
    }
  };

  if (!anterior || anterior === nueva) {
    entrar();
  } else {
    // Primero se desvanece la sección anterior y después entra la nueva.
    anterior.classList.remove('activa');
    anterior.classList.add('saliendo');
    temporizadorCambio = setTimeout(entrar, 170);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function iniciarApp() {
  decorarIconos(document.getElementById('menu-principal'));
  inicializarReproductor();
  inicializarSelects();

  await Promise.all(SECCIONES.map(cargarSeccion));
  mostrarSeccion('inicio');
}

document
  .getElementById('menu-principal')
  .addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-seccion]');

    if (!boton) return;

    mostrarSeccion(boton.dataset.seccion);
  });

// Botones de acceso rápido dentro de las secciones (data-ir="buscador", etc.).
document.addEventListener('click', (evento) => {
  const atajo = evento.target.closest('[data-ir]');

  if (!atajo) return;

  // Se simula el clic en el menú para que cada sección recargue sus datos.
  document
    .querySelector(`#menu-principal button[data-seccion="${atajo.dataset.ir}"]`)
    ?.click();
});

iniciarApp();
