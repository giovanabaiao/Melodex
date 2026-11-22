import {ColeccionStorage} from "./coleccionStorage.js";
import {mostrarToast} from "./toast.js";

/* Guarda una canción con su valoración, comentario y fecha de guardado. */
export function guardarItemSeleccionado(item, valoracion, comentario){
    
    /* Convertir la valoración a número y comprobar que sea un entero entre 1 y 5. */
    const nota = Number(valoracion);
    if(!Number.isInteger(nota) || nota < 1 || nota > 5){
        return "La valoración debe estar entre 1 y 5.";
    }

    /* Asignar la valoración, el comentario y la fecha actual al item. */
    item.valoracion = nota;
    item.comentario = comentario;
    item.fechaGuardado = new Date().toISOString();

    /* Guardar el item en localStorage. Si ya existe, guardar() devuelve false. */
    const guardado = ColeccionStorage.guardar(item);

    if(guardado === false){
        return "Esta canción ya está guardada en tu colección.";
    }
    return "Canción guardada correctamente.";
}

/* Inicializa el evento del botón para guardar el item seleccionado. */
export function inicializarGuardado(itemSeleccionado){
    const boton = document.getElementById("btn-guardar");
    if(boton === null){
        return;
    }

    /* Al pulsar el botón, obtener los datos introducidos por el usuario y guardar el item seleccionado. */
    boton.addEventListener("click", function(){
        const valoracion = document.getElementById("detalle-valoracion").value;
        const comentario = document.getElementById("detalle-comentario").value;
        
        /* Guardar la canción y mostrar el mensaje correspondiente. */
        const mensaje = guardarItemSeleccionado(itemSeleccionado, valoracion, comentario);
        mostrarToast(mensaje, mensaje.startsWith("Canción guardada") ? "ok" : "error");
    });
}