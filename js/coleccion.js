import { ColeccionStorage } from "./coleccionStorage.js";
import { escapeHTML} from "./item.js";

//Lista comleta de itens guardados que se rellena al inicializar
let items=[];
//Item que se esta enseñando en el panel de detalle
let itemSeleccionado=null;

//ISSUE #8-> ----------------------------------------------------------

//Dibujar las tarjetas de la lista que recibe

function pintarLista(lista){
    const contenedor = document.getElementById('lista-coleccion');
    //Si no hay ningun item, se muestra un mensaje
    if(items.length===0){
        contenedor.innerHTML = '<p> Todavía no has guardado ningún item.</p>';
        return;
    }

    //Si hay items, se dibujan
    if (lista.length===0){
        contenedor.innerHTML='<p> No hay items que coincidan con la búsqueda.</p>';
    return;
    }
    
    //Converter cada item en su HTML y unirlos en un solo string
    contenedor.innerHTML=lista.map(item => item.toHTML()).join('');

    //Si hay algun item seleccionado, se resalta en la lista
    if(itemSeleccionado){
        const tarjeta = contenedor.querySelector(
            `[data-id="${CSS.escape(String(itemSeleccionado.id))}"]`
        );
        if(tarjeta){
            tarjeta.classList.add('seleccionado');
        }
    }
}

//Rellena el panel de la derecha con las propiedades del item elegido
function mostrarDetalle(item){
    itemSeleccionado= item;
    const detalle= document.getElementById('detalle-coleccion'); //panel de detalle
    detalle.innerHTML= item.toDetalleHTML(); //panel completo

    //toDetalleHTML() incluye un boton de guardar pensado para el buscador, pero aqui no se usa
    const botonGuardar = detalle.querySelector('#btn-guardar');
    if(botonGuardar){
        botonGuardar.remove(); //lo quitamos para no confundir al usuario
    }

    //valoracion y comentario se muestran (se editan en el issue #11)
    detalle.querySelectorAll('select, textarea').forEach(campo => {
        campo.disabled = true; //campos solo de lectura
    });
}

//Se ejecuta al hacer click dentro de la lista
function alPulsarLista(evento){
    //sube desde elemento pulsado hasta su tarjeta
    const tarjeta = evento.target.closest('.item-card');
    if (!tarjeta) return; //Caso pulsado fuerda de la tarjeta, no se hace nada

    //busca aquele item cuyo id coincide con el data id de la tarjeta (como texto)
    const item= items.find(i => String(i.id) === tarjeta.dataset.id);
    if (!item) return; //Se no lo encuentra, sale

    //Quitamos el resalte de todas las tarjetas
    document.querySelectorAll('#lista-coleccion .item-card')
        .forEach(t => t.classList.remove('seleccionado'));
    //Resalta solo la pulsada
    tarjeta.classList.add('seleccionado');
    
    mostrarDetalle(item); //Enseña las propiedades del item
}

//ISSUE #9---------------------------------------------

function crearControles(){
    const controles = document.getElementById('controles-coleccion');

    //las opciones de género se rellenar aparte en actualizarGewneros()
      controles.innerHTML = `
    <label for="filtro-texto">Buscar</label>
    <input type="text" id="filtro-texto" placeholder="Título o artista...">

    <label for="filtro-genero">Género</label>
    <select id="filtro-genero">
      <option value="">Todos</option>
    </select>

    <label for="filtro-valoracion">Valoración mínima</label>
    <select id="filtro-valoracion">
      <option value="0">Cualquiera</option>
      <option value="1">1 o más</option>
      <option value="2">2 o más</option>
      <option value="3">3 o más</option>
      <option value="4">4 o más</option>
      <option value="5">5</option>
    </select>

    <label for="orden-coleccion">Ordenar por</label>
    <select id="orden-coleccion">
      <option value="fecha-desc">Más recientes primero</option>
      <option value="fecha-asc">Más antiguos primero</option>
      <option value="titulo-asc">Título (A-Z)</option>
      <option value="titulo-desc">Título (Z-A)</option>
      <option value="valoracion-desc">Mejor valorados primero</option>
      <option value="valoracion-asc">Peor valorados primero</option>
    </select>

    <button type="button" id="btn-sorprendeme">🎲 Sorpréndeme</button>
  `;

    controles.addEventListener('input', actualizarVista);
    controles.addEventListener('change', actualizarVista);
}

//rellena el select de género con los géneros que existen en la colección
function actualizarGeneros(){
    const select = document.getElementById('filtro-genero');
    const seleccionado = select.value; //guardamos la elección para no perderla

    // eleminar repes
    const generos = [...new Set(items.map(i => i.genre).filter(Boolean))];

    
    select.innerHTML =
        '<option value="">Todos</option>' +
        generos
            .map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`)
            .join('');

    //Restaura la eleccion anterior si ese genero sigue existiendo
    select.value = generos.includes(seleccionado) ? seleccionado : '';
}

//Devolvemos solo los items que cumplen los filtros
function filtrar(lista){
    //leemos el valor actual de cada control
    const texto= document.getElementById('filtro-texto').value.trim().toLowerCase();
    const genero = document.getElementById('filtro-genero').value;
    const minimo = Number(document.getElementById('filtro-valoracion').value);

    //el filter() se queda con aquellos items para los que la función devuelve true.
    return lista.filter(item => {
        //coincide si el texto aparece en el título o en el artista
        const coincideTexto =
            item.title.toLowerCase().includes(texto) ||
            item.nombreArtista.toLowerCase().includes(texto);

        //genero vacio="todos"
        const coincideGenero = genero === '' || item.genre === genero;
        //Un item sin valorar cuenta como 0
        const coincideValoracion = (item.valoracion ?? 0) >=minimo;

        //Solo pasa el item si cumple los 3 filtros a la vez
        return coincideTexto && coincideGenero && coincideValoracion;
    });
}

// ISSUE #10 -----------------------------------------------------------------
//Devuelve una copia ordenada segun el select
function ordenar(lista){
    const[campo, sentido] = document.getElementById('orden-coleccion').value.split('-');
    const factor = sentido === 'asc' ? 1 : -1;

    return [...lista].sort((a, b) => {
        if (campo === 'titulo'){
            return a.title.localeCompare(b.title, 'es')*factor;
        }
        if (campo === 'valoracion'){
            return ((a.valoracion ?? 0) - (b.valoracion ?? 0)) * factor;
        }

        return (new Date(a.fechaGuardado)- new Date(b.fechaGuardado))*factor;
    });
}

// Coordinacion --------------------

//Primero aplico el filtro y despues la ordenación
function actualizarVista(){
    pintarLista(ordenar(filtrar(items)));
}

//Vuelve a leer el localStorage para ver canciones guardadas en el buscador sin pulsar F5
function recargarColeccion(){
    items = ColeccionStorage.obtenerComoItems();
    itemSeleccionado = null;
    document.getElementById('detalle-coleccion').innerHTML = '<p>Selecciona un item para ver sus propiedades.</p>';
    actualizarGeneros();
    actualizarVista();
}

//Dibujar filtros y orden y despues cargar los items y pintar la lista por primera vez
export function inicializarColeccion(){
    crearControles();

    // Al pulsar el botón, se elige y muestra una canción aleatoria de la colección.
document
    .getElementById('btn-sorprendeme')
    .addEventListener('click', sorprender);

    recargarColeccion();

    //Solo 1 listener para todas las tarjetas
    document.getElementById('lista-coleccion').addEventListener('click', alPulsarLista);

    //Cada vez que se pulsa MI COLECCION en el menu, se vuelve a leer el localStorage
    document.querySelector('#menu-principal button[data-seccion="coleccion"]').addEventListener('click', recargarColeccion);
}

// EXTRA: selecciona una canción aleatoria de Mi colección.
function sorprender() {
    // Respeta los filtros y la ordenación actuales.
    const lista = ordenar(filtrar(items));

    if (lista.length === 0) {
        const mensaje = items.length === 0
            ? 'No hay canciones guardadas. Guarda alguna desde el Buscador.'
            : 'No hay canciones que coincidan con los filtros actuales.';

        itemSeleccionado = null;

        document.getElementById('detalle-coleccion').innerHTML =
            `<p>${mensaje}</p>`;

        return;
    }

    // Evita repetir la canción seleccionada si existen otras opciones.
    let candidatas = itemSeleccionado
        ? lista.filter(
            item => String(item.id) !== String(itemSeleccionado.id)
        )
        : lista;

    // Si solo hay una canción visible, se selecciona esa.
    if (candidatas.length === 0) {
        candidatas = lista;
    }

    // Selecciona un índice aleatorio válido.
    const indiceAleatorio = Math.floor(
        Math.random() * candidatas.length
    );

    const elegido = candidatas[indiceAleatorio];

    mostrarDetalle(elegido);
    pintarLista(lista);

    // Desplaza la página hasta la tarjeta seleccionada.
    const tarjeta = document.querySelector(
        `#lista-coleccion [data-id="${CSS.escape(String(elegido.id))}"]`
    );

    if (tarjeta) {
        tarjeta.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}
