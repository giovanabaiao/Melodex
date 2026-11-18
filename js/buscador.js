import { buscarEnApi } from './api.js';
import { Item } from './item.js';

// Muestra un mensaje dentro de un contenedor.
function mostrarMensaje(contenedor, mensaje) {
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
  const detalleItem = document.getElementById('detalle-item');
  const botonBuscar = formulario.querySelector(
    'button[type="submit"]'
  );

  // Conserva los Item de la última búsqueda para poder encontrarlos por id.
  let itemsEncontrados = [];

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

    // Borra los resultados y la selección anteriores.
    itemsEncontrados = [];
    contenedorResultados.replaceChildren();

    mostrarMensaje(
      detalleItem,
      'Selecciona un resultado para ver sus propiedades.'
    );

    try {
      const resultados = await buscarEnApi(termino, 'texto');

      if (resultados.length === 0) {
        estado.textContent = '';

        mostrarMensaje(
          contenedorResultados,
          'No se encontraron resultados.'
        );

        return;
      }

      itemsEncontrados = resultados.map(
        (datos) => new Item(datos)
      );

      contenedorResultados.innerHTML = itemsEncontrados
        .map((item) => item.toHTML())
        .join('');

      estado.textContent =
        `Se encontraron ${itemsEncontrados.length} resultados.`;
    } catch (error) {
      estado.textContent = '';

      mostrarMensaje(
        contenedorResultados,
        'No se pudo realizar la búsqueda.'
      );

      console.error(error);
    } finally {
      botonBuscar.disabled = false;
    }
  });

  // Delegación de eventos: detecta clics en las tarjetas generadas.
  contenedorResultados.addEventListener('click', function (evento) {
    const tarjeta = evento.target.closest('.item-card');

    if (!tarjeta || !contenedorResultados.contains(tarjeta)) {
      return;
    }

    const itemSeleccionado = itemsEncontrados.find(
      (item) => String(item.id) === tarjeta.dataset.id
    );

    if (!itemSeleccionado) {
      return;
    }

    // Quita la marca de la tarjeta seleccionada anteriormente.
    contenedorResultados
      .querySelectorAll('.item-card')
      .forEach((itemCard) => {
        itemCard.classList.remove('seleccionado');
      });

    // Marca la nueva tarjeta seleccionada.
    tarjeta.classList.add('seleccionado');

    // Muestra todas las propiedades y los campos del usuario.
    detalleItem.innerHTML = itemSeleccionado.toDetalleHTML();
  });
}
