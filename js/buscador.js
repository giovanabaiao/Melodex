import { buscarEnApi } from './api.js';
import { Item } from './item.js';

// Muestra un mensaje dentro de la zona de resultados.
function mostrarMensajeResultados(contenedor, mensaje) {
  const parrafo = document.createElement('p');
  parrafo.textContent = mensaje;
  contenedor.replaceChildren(parrafo);
}

export function inicializarBuscador() {
  const formulario = document.getElementById('form-buscador');
  const input = document.getElementById('input-busqueda');
  const estado = document.getElementById('estado-busqueda');
  const contenedorResultados = document.getElementById(
    'resultados-busqueda'
  );
  const botonBuscar = formulario.querySelector(
    'button[type="submit"]'
  );

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
    botonBuscar.disabled = true;
    contenedorResultados.replaceChildren();

    try {
      const resultados = await buscarEnApi(termino, 'texto');

      if (resultados.length === 0) {
        estado.textContent = '';

        mostrarMensajeResultados(
          contenedorResultados,
          'No se encontraron resultados.'
        );

        return;
      }

      // Convierte cada resultado de la API en una instancia de Item.
      const items = resultados.map(
        (datos) => new Item(datos)
      );

      // Genera las tarjetas exclusivamente mediante Item.toHTML().
      contenedorResultados.innerHTML = items
        .map((item) => item.toHTML())
        .join('');

      estado.textContent = `Se encontraron ${items.length} resultados.`;
    } catch (error) {
      estado.textContent = 'No se pudo realizar la búsqueda.';

      mostrarMensajeResultados(
        contenedorResultados,
        'Ha ocurrido un error al consultar la API.'
      );

      console.error(error);
    } finally {
      // Se reactiva tanto si la búsqueda funciona como si falla.
      botonBuscar.disabled = false;
    }
  });
}
