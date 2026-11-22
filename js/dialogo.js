// Diálogo de confirmación dentro de la página (sustituye a confirm()).
// Uso:
//   if (await confirmar({ titulo: '¿Eliminar?', mensaje: '...', textoOk: 'Eliminar' })) { ... }

export function confirmar({
  titulo = '¿Estás seguro?',
  mensaje = '',
  textoOk = 'Aceptar',
  textoCancelar = 'Cancelar',
  peligro = false,
} = {}) {
  return new Promise((resolver) => {
    const anterior = document.activeElement;

    const fondo = document.createElement('div');
    fondo.className = 'dialogo-fondo';

    const caja = document.createElement('div');
    caja.className = 'dialogo';
    caja.setAttribute('role', 'alertdialog');
    caja.setAttribute('aria-modal', 'true');
    caja.setAttribute('aria-labelledby', 'dialogo-titulo');
    caja.setAttribute('aria-describedby', 'dialogo-mensaje');

    caja.innerHTML = `
      <div class="dialogo-icono ${peligro ? 'peligro' : ''}" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>
        </svg>
      </div>
      <h3 id="dialogo-titulo"></h3>
      <p id="dialogo-mensaje"></p>
      <div class="dialogo-acciones">
        <button type="button" class="btn-secundario" data-resp="no"></button>
        <button type="button" class="${peligro ? 'btn-peligro-solido' : 'btn-primario'}" data-resp="si"></button>
      </div>`;

    // textContent evita inyectar HTML con los textos recibidos.
    caja.querySelector('h3').textContent = titulo;
    caja.querySelector('#dialogo-mensaje').textContent = mensaje;
    caja.querySelector('[data-resp="no"]').textContent = textoCancelar;
    caja.querySelector('[data-resp="si"]').textContent = textoOk;

    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    requestAnimationFrame(() => fondo.classList.add('visible'));

    const cerrar = (respuesta) => {
      document.removeEventListener('keydown', alTeclear, true);
      fondo.classList.remove('visible');
      setTimeout(() => fondo.remove(), 220);
      if (anterior && anterior.focus) anterior.focus();
      resolver(respuesta);
    };

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        cerrar(false);
      }
    };

    document.addEventListener('keydown', alTeclear, true);

    fondo.addEventListener('click', (evento) => {
      if (evento.target === fondo) cerrar(false);
      const boton = evento.target.closest('[data-resp]');
      if (boton) cerrar(boton.dataset.resp === 'si');
    });

    // El foco empieza en "Cancelar": es la opción segura.
    caja.querySelector('[data-resp="no"]').focus();
  });
}
