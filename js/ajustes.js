//Aqui hacemos la gestion del tema claro/oscuro y la persistencia de este en el localStorage

const CLAVE_TEMA = 'melodex-tema'; // Constante para la clave del tema en el localStorage, esta en una constante para que no se repita el string en varios lugares y sea más fácil de cambiar si es necesario

function aplicarTema(tema){ //La función que cambia el tema
    document.documentElement.setAttribute('data-theme', tema); //Escribe el data-theme en el html, es lo que activa (o desactiva) el bloque [data-theme="dark"] del CSS
}

aplicarTema(localStorage.getItem(CLAVE_TEMA) || 'light'); //Al abrir el app: lee el tema salvo y lo aplica, y si no utiliza el light

function sincronizarInterruptor(){ //Hace con que el interruptor refleje el tema actual
    const interruptor = document.getElementById('interruptor-tema'); //Busca el interruptor 
    if (interruptor){
        interruptor.checked=document.documentElement.getAttribute('data-theme')==='dark'; //Si el tema es dark, el interruptor se pone en checked
    }
}

document.addEventListener('change', (evento) => { //Escucha los cambios en cualquier campo de la página
    if (evento.target.id === 'interruptor-tema'){ //Reacciona SOLAMENTE al nuestro interruptor
        const tema = evento.target.checked ? 'dark':'light'; // Interruptor encendido=oscuro, apagado=claro
        aplicarTema(tema); //Aplica el tema
        localStorage.setItem(CLAVE_TEMA, tema); //Guarda el tema en el localStorage
    }   
})

//Cuando la plantilla de Ajustes se inserte en la página, sincroniza el interruptor con el tema actual
new MutationObserver(sincronizarInterruptor)
    .observe(document.body, {childList: true, subtree: true}); //Observa los cambios en el body y sus hijos, y llama a sincronizarInterruptor cuando se detecte un cambio
