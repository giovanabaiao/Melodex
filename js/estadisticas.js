import { ColeccionStorage } from "./coleccionStorage.js";

/* Inicializa las estadisticas de la colección */
export function inicializarEstadisticas(){

    const canciones = ColeccionStorage.obtenerTodos();
    /* Seleccionar solo las canciones con una valoración válida entre 1 y 5 */
    const cancionesValoradas = canciones.filter((cancion) =>{
        const valoracion = Number(cancion.valoracion);
        if(Number.isInteger(valoracion) && valoracion >= 1 && valoracion <= 5){
            return true;
        }
        else{
            return false;
        }
    });


    /*Calcular y mostrar el número total de canciones */
    const totalCanciones = canciones.reduce((contador, cancion) => contador + 1, 0);
    document.getElementById("total-canciones").textContent = totalCanciones;


    /* Calcular la valoración media */
    const sumaValoraciones = cancionesValoradas.reduce((suma, cancion) => suma + Number(cancion.valoracion), 0);
    let media = 0;
    if(cancionesValoradas.length > 0){
        media = sumaValoraciones / cancionesValoradas.length;
    }
    document.getElementById("valoracion-media").textContent = media.toFixed(2);


    /* Buscar canción la valoración más alta */
    const mejorCancion = cancionesValoradas.reduce((mejor, cancion) => {
        if(mejor === null || Number(cancion.valoracion) > Number(mejor.valoracion)){
            return cancion;
        }
        return mejor;
    }, null);
    if(mejorCancion !== null){
        document.getElementById("mejor-cancion").textContent = mejorCancion.title;
    }
    else{
        document.getElementById("mejor-cancion").textContent = "-";
    }


    /* Buscar canción la valoración más baja */
    const peorCancion = cancionesValoradas.reduce((peor, cancion) => {
        if(peor === null || Number(cancion.valoracion) < Number(peor.valoracion)){
            return cancion;
        }
        return peor;
    }, null);
    if(peorCancion !== null){
        document.getElementById("peor-cancion").textContent = peorCancion.title;
    }
    else{
        document.getElementById("peor-cancion").textContent = "-";
    }

    
    /* Calcular número de canciones por género */
    const distribucion = canciones.reduce((generos, cancion) => {
        const genero = cancion.genre || "Sin género";
        if(generos[genero] === undefined){
            generos[genero] = 0;
        }
        generos[genero]++;
        return generos;
    }, {});
    const contenedor = document.getElementById("distribucion-generos");
    contenedor.innerHTML = ""; //Borrar contenido del contenedor
    for(const genero in distribucion){
        const parrafo = document.createElement("p");
        
        if(distribucion[genero] === 1){
            parrafo.textContent = genero + ": 1 canción";
        }
        else{
            parrafo.textContent = genero + ": " + distribucion[genero] + " canciones";
        }
        contenedor.appendChild(parrafo);
    }


    /* Mostrar mensaje si la colección esta vacía*/
    const mensaje = document.getElementById("mensaje-estadisticas");
    if(canciones.length === 0){
        mensaje.textContent = "Todavía no tienes canciones guardadas en tu colección.";
    }
    else{
        mensaje.textContent = "";
    }
}