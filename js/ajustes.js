//Aqui hacemos la gestion del tema claro/oscuro y la persistencia de este en el localStorage
const CLAVE_TEMA = 'melodex-tema'; // Constante para la clave del tema en el localStorage, esta en una constante para que no se repita el string en varios lugares y sea más fácil de cambiar si es necesario

function aplicarTema(tema){ //La función que cambia el tema
    document.documentElement.setAttribute('data-theme', tema); //Escribe el data-theme en el html, es lo que activa (o desactiva) el bloque [data-theme="dark"] del CSS
}

aplicarTema(localStorage.getItem(CLAVE_TEMA) || 'light'); //Al abrir el app: lee el tema salvo y lo aplica, y si no utiliza el light

export function inicializarAjustes(){ //app.js la ejecuta justo después de insertar la plantilla de Ajustes; "export" permite que app.js la importe
    const interruptor = document.getElementById('interruptor-tema'); //Busca el interruptor 
    if (!interruptor){ //Si no existe, no hay nada que inicializar
        return;
    }

interruptor.checked=document.documentElement.getAttribute('data-theme')==='dark'; //Si el tema es dark, el interruptor se pone en checked

    interruptor.addEventListener('change', () => { //Escucha los cambios SOLAMENTE en nuestro interruptor
        const tema = interruptor.checked ? 'dark':'light'; // Interruptor encendido=oscuro, apagado=claro
        aplicarTema(tema); //Aplica el tema
        localStorage.setItem(CLAVE_TEMA, tema); //Guarda el tema en el localStorage
    });
}
