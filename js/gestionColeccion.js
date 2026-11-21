
import { ColeccionStorage } from './coleccionStorage.js';

let items = [];
let idSeleccionado = null;

const MENSAJE_SIN_SELECCION = '<p>Selecciona un item para modificarlo o eliminarlo.</p>';

// Dibuja las tarjetas con el mismo HTML que usa Mi Colección.
function pintarLista() 
{
  const lista = document.getElementById('lista-gestion');
  const botonVaciar = document.getElementById('btn-vaciar');

  botonVaciar.disabled = items.length === 0;

  if (items.length === 0) 
  {
    lista.innerHTML = '<p>Todavía no has guardado ningún item.</p>';
    return;
  }

  lista.innerHTML = items.map(item => item.toHTML()).join('');

  if (idSeleccionado !== null) 
    {
      const tarjeta = lista.querySelector( `[data-id="${CSS.escape(idSeleccionado)}"]` );
    
      if (tarjeta) 
    {
      tarjeta.classList.add('seleccionado');
    }
  }
}

function mostrarDetalle(item) 
{
  idSeleccionado = String(item.id);

  const detalle = document.getElementById('detalle-gestion');
  detalle.innerHTML = item.toDetalleHTML();

  const valoracion = detalle.querySelector('#detalle-valoracion');
  const comentario = detalle.querySelector('#detalle-comentario');

  const etiquetaValoracion = detalle.querySelector('label[for="detalle-valoracion"]');
  const etiquetaComentario = detalle.querySelector('label[for="detalle-comentario"]');

  valoracion.id = 'gestion-valoracion';
  comentario.id = 'gestion-comentario';

  etiquetaValoracion.htmlFor = 'gestion-valoracion';
  etiquetaComentario.htmlFor = 'gestion-comentario';

  detalle.querySelector('#btn-guardar').outerHTML = `
    <div class="gestion-acciones">
      <button type="button" data-accion="guardar">Guardar cambios</button>
      <button type="button" data-accion="eliminar">Eliminar</button>
    </div>`;
}

function limpiarDetalle() 
{
  idSeleccionado = null;
  document.getElementById('detalle-gestion').innerHTML = MENSAJE_SIN_SELECCION;
}

function recargar() 
{
  items = ColeccionStorage.obtenerComoItems();

  const seleccionado = items.find(item => String(item.id) === idSeleccionado);

  if (seleccionado) 
  {
    mostrarDetalle(seleccionado);
  } 
  else 
  {
    limpiarDetalle();
  }

  pintarLista();

}

function alPulsarLista(evento) 
{
  const tarjeta = evento.target.closest('.item-card');
  if (!tarjeta) return;

  const item = items.find(i => String(i.id) === tarjeta.dataset.id);
  if (!item) return;

  mostrarDetalle(item);
  pintarLista();
}

function guardarCambios(detalle) 
{
  const item = items.find(i => String(i.id) === idSeleccionado);
  if (!item) return;

  try 
  {
    const valoracion = detalle.querySelector('#gestion-valoracion').value;
    const comentario = detalle.querySelector('#gestion-comentario').value;

    const nuevaValoracion = valoracion === '' ? null : Number(valoracion);
    const nuevoComentario = comentario.trim();

    const sinCambios =
      nuevaValoracion === item.valoracion &&
      nuevoComentario === (item.comentario ?? '').trim();

    if (sinCambios) 
    {
      alert('No has modificado nada.');
      return;
    }

    item.valoracion = nuevaValoracion;
    item.comentario = nuevoComentario;

    const guardado = ColeccionStorage.actualizar(item);

    idSeleccionado = null;
    recargar();

    alert(guardado
      ? 'Los cambios se han guardado correctamente.'
      : 'No se encontró la canción en la colección.');
  } 
  catch (error) 
  {
    console.error(error);
    alert('No se pudieron guardar los cambios.');
  }
}

function eliminarSeleccionado() 
{
  if (idSeleccionado === null) return;

  ColeccionStorage.eliminar(idSeleccionado);
  idSeleccionado = null;
  recargar();
}

function vaciarColeccion() 
{
  const seguro = confirm('¿Seguro que quieres vaciar toda la colección?');
  if (!seguro) return;

  ColeccionStorage.vaciar();
  idSeleccionado = null;
  recargar();
}

export function inicializarGestionColeccion() 
{
  const lista = document.getElementById('lista-gestion');
  const detalle = document.getElementById('detalle-gestion');
  const botonVaciar = document.getElementById('btn-vaciar');

  lista.addEventListener('click', alPulsarLista);

  detalle.addEventListener('click', (evento) => 
  {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    if (boton.dataset.accion === 'guardar') guardarCambios(detalle);
    else if (boton.dataset.accion === 'eliminar') eliminarSeleccionado();
  });

  botonVaciar.addEventListener('click', vaciarColeccion);

  // Cada vez que se pulsa GESTIONAR COLECCIÓN en el menú, se vuelve a leer el localStorage
  document
    .querySelector('#menu-principal button[data-seccion="gestionColeccion"]')
    .addEventListener('click', recargar);

  recargar();
}