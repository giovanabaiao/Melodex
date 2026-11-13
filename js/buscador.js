import { buscarEnApi } from './api.js';

export function inicializarBuscador() {
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
