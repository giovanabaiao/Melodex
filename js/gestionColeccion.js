
import { ColeccionStorage } from './coleccionStorage.js';
import { escapeHTML } from './item.js';

let idEnEdicion = null;

const BOTONES_NORMALES = `
    <div class="gestion-acciones">
        <button type="button" data-accion="editar">Modificar</button>
        <button type="button" data-accion="eliminar">Eliminar</button>
    </div>`;

function formularioEdicion(item) 
{
    const opciones = [1, 2, 3, 4, 5]
        .map(n => `<option value="${n}" ${item.valoracion === n ? 'selected' : ''}>${n}</option>`)
        .join('');

    return `
        <div class="gestion-edicion">
        <label>Valoración (1-5)
            <select class="edit-valoracion">
            <option value="">Sin valorar</option>
            ${opciones}
            </select>
        </label>
        <label>Comentario
            <textarea class="edit-comentario" rows="3">${escapeHTML(item.comentario)}</textarea>
        </label>
            <button type="button" data-accion="guardar">Guardar cambios</button>
            <button type="button" data-accion="cancelar">Cancelar</button>
        </div>`;
}

function renderizar() 
{
    const lista = document.getElementById('lista-gestion');
    const botonVaciar = document.getElementById('btn-vaciar');
    const items = ColeccionStorage.obtenerComoItems();

    botonVaciar.disabled = items.length === 0;

    if (items.length === 0) {
        lista.innerHTML = '<p>Todavía no has guardado ninguna canción.</p>';
        return;
    }

    lista.innerHTML = items.map(item => 
    {
        // Si es la canción en edición mostramos el formulario; si no, los botones.
        const zonaInferior = String(item.id) === idEnEdicion
        ? formularioEdicion(item)
        : BOTONES_NORMALES;

        return `
        <div class="gestion-item" data-id="${escapeHTML(item.id)}">
            ${item.toHTML("480x480")}
            ${zonaInferior}
        </div>`;
    }).join('');
}

// Avisa al resto de la app de que la colección ha cambiado.
function avisarCambio() 
{
    document.dispatchEvent(new CustomEvent('coleccion-cambiada'));
}

function eliminarCancion(id) 
{
    ColeccionStorage.eliminar(id);
    avisarCambio();
}

function empezarEdicion(id) 
{
    idEnEdicion = id;
    renderizar();
}

function cancelarEdicion() 
{
    idEnEdicion = null;
    renderizar();
}

function guardarCambios(id, contenedor) 
{
    // 1. Buscamos la canción guardada.
    const item = ColeccionStorage.obtenerComoItems().find(cancion => String(cancion.id) === id);
        if (!item) return;

    const valoracion = contenedor.querySelector('.edit-valoracion').value;
    const comentario = contenedor.querySelector('.edit-comentario').value;

    item.valoracion = valoracion === '' ? null : Number(valoracion);
    item.comentario = comentario.trim();
    ColeccionStorage.actualizar(item);

    idEnEdicion = null;
    avisarCambio();
}

function vaciarColeccion() 
{
    const seguro = confirm('¿Seguro que quieres vaciar toda la colección?');
    if (!seguro) return;

    ColeccionStorage.vaciar();
    avisarCambio();
}

export function inicializarGestionColeccion() 
{
    const lista = document.getElementById('lista-gestion');
    const botonVaciar = document.getElementById('btn-vaciar');


    lista.addEventListener('click', (evento) => 
    {
        
        // ¿Se ha pulsado un botón de acción? 
            const boton = evento.target.closest('button[data-accion]');
            if (!boton) return;

        // ¿A qué canción pertenece ese botón?
            const contenedor = boton.closest('.gestion-item');
            const id = contenedor.dataset.id;

        // ¿Qué acción es? 
            const accion = boton.dataset.accion;

            if (accion === 'eliminar') eliminarCancion(id);
            else if (accion === 'editar') empezarEdicion(id);
            else if (accion === 'cancelar') cancelarEdicion();
            else if (accion === 'guardar') guardarCambios(id, contenedor);
    });

    botonVaciar.addEventListener('click', vaciarColeccion);

    document.addEventListener('coleccion-cambiada', () => 
    {
        idEnEdicion = null;
        renderizar();
    });

    renderizar();
}
