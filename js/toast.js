// Avisos emergentes (toasts) que sustituyen a alert().
// tipo: 'ok' | 'error' | 'info'

function obtenerContenedor() {
  let contenedor = document.getElementById('toasts');

  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toasts';
    contenedor.setAttribute('role', 'status');
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }

  return contenedor;
}

export function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;

  obtenerContenedor().appendChild(toast);

  // Pequeño retraso para que se active la animación de entrada.
  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Por si la transición no se dispara (pestaña en segundo plano).
    setTimeout(() => toast.remove(), 600);
  }, 3200);
}
