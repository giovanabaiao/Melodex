const API_BASE_URL = 'https://api.audius.co/v1';

export async function buscarEnApi(termino, tipo) {
  const terminoLimpio = termino.trim();

  if (terminoLimpio === "") {
    return [];
  }

  const terminoCodificado = encodeURIComponent(terminoLimpio);

  let url;

  if (tipo === "id") {
    url = `${API_BASE_URL}/tracks/${terminoCodificado}?app_name=Melodex`;
  } else {
    url = `${API_BASE_URL}/tracks/search?query=${terminoCodificado}&app_name=Melodex`;
  }

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error de la API: ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  if (tipo === "id") {
    return datos.data ? [datos.data] : [];
  }

  return Array.isArray(datos.data) ? datos.data : [];

}
