import { ColeccionStorage } from "./coleccionStorage.js";
import { escapeHTML } from "./item.js";

// Dibuja una fila de barra horizontal (etiqueta + barra + valor).
function filaBarra(etiqueta, valor, maximo, sufijo = "") {
    const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;
    return `
        <div class="barra-fila">
            <span class="barra-etiqueta">${etiqueta}</span>
            <div class="barra-pista"><div class="barra-relleno" style="width:${porcentaje}%"></div></div>
            <span class="barra-valor">${valor}${sufijo}</span>
        </div>`;
}

/* Inicializa las estadisticas de la colección */
export function inicializarEstadisticas(){

    const canciones = ColeccionStorage.obtenerTodos();
    /* Seleccionar solo las canciones con una valoración válida entre 1 y 5 */
    const cancionesValoradas = canciones.filter((cancion) =>{
        const valoracion = Number(cancion.valoracion);
        return Number.isInteger(valoracion) && valoracion >= 1 && valoracion <= 5;
    });


    /* Número total de canciones */
    document.getElementById("total-canciones").textContent = canciones.length;


    /* Valoración media */
    const sumaValoraciones = cancionesValoradas.reduce((suma, cancion) => suma + Number(cancion.valoracion), 0);
    let media = 0;
    if(cancionesValoradas.length > 0){
        media = sumaValoraciones / cancionesValoradas.length;
    }
    document.getElementById("valoracion-media").textContent = media.toFixed(2);


    /* Canción con la valoración más alta */
    const mejorCancion = cancionesValoradas.reduce((mejor, cancion) => {
        if(mejor === null || Number(cancion.valoracion) > Number(mejor.valoracion)){
            return cancion;
        }
        return mejor;
    }, null);
    document.getElementById("mejor-cancion").textContent = mejorCancion !== null ? mejorCancion.title : "-";


    /* Canción con la valoración más baja */
    const peorCancion = cancionesValoradas.reduce((peor, cancion) => {
        if(peor === null || Number(cancion.valoracion) < Number(peor.valoracion)){
            return cancion;
        }
        return peor;
    }, null);
    document.getElementById("peor-cancion").textContent = peorCancion !== null ? peorCancion.title : "-";


    /* Número de canciones por género (de mayor a menor) */
    const distribucion = canciones.reduce((generos, cancion) => {
        const genero = cancion.genre || "Sin género";
        generos[genero] = (generos[genero] ?? 0) + 1;
        return generos;
    }, {});
    const ordenados = Object.entries(distribucion).sort((a, b) => b[1] - a[1]);
    const maxGenero = ordenados.length ? ordenados[0][1] : 0;

    document.getElementById("distribucion-generos").innerHTML =
        ordenados.length
            ? ordenados.map(([genero, n]) => filaBarra(escapeHTML(genero), n, maxGenero)).join("")
            : '<p class="vacio">Sin datos todavía.</p>';


    /* Cuántas canciones hay con cada nota (de 5★ a 1★) */
    const porNota = [5, 4, 3, 2, 1].map((nota) => [
        nota,
        cancionesValoradas.filter((c) => Number(c.valoracion) === nota).length,
    ]);
    const maxNota = Math.max(...porNota.map(([, n]) => n), 0);

    document.getElementById("distribucion-valoraciones").innerHTML =
        cancionesValoradas.length
            ? porNota.map(([nota, n]) => filaBarra(`${nota} ★`, n, maxNota)).join("")
            : '<p class="vacio">Sin valoraciones todavía.</p>';


    /* Mensaje si la colección esta vacía */
    const mensaje = document.getElementById("mensaje-estadisticas");
    mensaje.textContent = canciones.length === 0
        ? "Todavía no tienes canciones guardadas en tu colección."
        : "";
}