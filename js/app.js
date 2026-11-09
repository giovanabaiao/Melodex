const SECCIONES = [
  'inicio',
  'buscador',
  'coleccion',
  'gestionColeccion',
  'estadisticas',
  'ajustes'
];

function inicializarBuscador() {

  const formulario = document.getElementById('form-buscador');
  const input = document.getElementById('input-busqueda');
  const estado = document.getElementById('estado-busqueda');

  formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const termino = input.value.trim();

    // Impide búsquedas vacías.
    if (termino === '') {
      estado.textContent = 'Escribe un término de búsqueda.';
      return;
    }

    // Informa al usuario mientras esperamos la respuesta.
    estado.textContent = 'Buscando...';

    try {
      const resultados = await buscarEnApi(termino, 'texto');

      if (resultados.length === 0) {
        estado.textContent = 'No se encontraron resultados.';
        return;
      }

      estado.textContent = `Se encontraron ${resultados.length} resultados.`;

      // Temporal: en el issue #4 se mostrarán en la página.
      console.log(resultados);
    } catch (error) {
      estado.textContent = 'No se pudo realizar la búsqueda.';
      console.error(error);
    }
  });
}

const INICIALIZADORES = {
  buscador: inicializarBuscador,
  coleccion: () => { },
  gestionColeccion: () => { },
  estadisticas: () => { }
};

async function cargarSeccion(nombre) {
  const contenedor = document.getElementById(`seccion-${nombre}`);

  try {
    const respuesta = await fetch(`templates/${nombre}.html`);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${nombre}`);
    }

    contenedor.innerHTML = await respuesta.text();

    if (INICIALIZADORES[nombre]) {
      INICIALIZADORES[nombre]();
    }
  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar esta sección.</p>';
    console.error(error);
  }
}

function mostrarSeccion(nombre) {
  document
    .querySelectorAll('.seccion')
    .forEach(sec => sec.classList.remove('activa'));

  document
    .getElementById(`seccion-${nombre}`)
    .classList.add('activa');

  document
    .querySelectorAll('#menu-principal button')
    .forEach(btn => btn.classList.remove('active'));

  const boton = document.querySelector(
    `#menu-principal button[data-seccion="${nombre}"]`
  );

  if (boton) {
    boton.classList.add('active');
  }
}

async function iniciarApp() {
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

iniciarApp();