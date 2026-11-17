// Clase que representa cada elemento (canción) obtenido de la API de Audius.
// - Convierte los datos de la API al modelo de la aplicación.
// - Guarda las propiedades de la API, la valoración, el comentario y la fecha de guardado.
// - Genera el HTML resumido de cada item y el panel de detalle.
// - Convierte un Item en un objeto plano para localStorage y lo reconstruye desde allí.
//
// Propiedades del Item:
//   API:      id, title, nombreArtista (user.name), artwork (objeto con URLs),
//             genre, mood, duration, releaseDate (release_date), description
//   Usuario:  valoracion (1-5 o null), comentario, fechaGuardado (ISO)
//   Derivada: imagen

// Evita que texto con caracteres especiales (&, <, >, ", ') rompa el HTML

export function escapeHTML(texto)
{
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export const IMAGEN_POR_DEFECTO =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">' +
        '<rect width="100%" height="100%" fill="#ddd"/>' +
        '<text x="50%" y="50%" font-size="14" text-anchor="middle" fill="#777">Sin portada</text>' +
        "</svg>"
    );

const ON_ERROR_IMG = `onerror="this.onerror=null;this.src='${IMAGEN_POR_DEFECTO}'"`;

export class Item
{
    constructor(datosApi = {})
    {
        // --- Datos de la API ---
        this.id = datosApi.id ?? "";
        this.title = datosApi.title ?? "Sin título";
        this.nombreArtista = datosApi.user?.name ?? "Artista desconocido";
        this.artwork = datosApi.artwork ?? null; // objeto completo: 
        this.genre = datosApi.genre ?? null;
        this.mood = datosApi.mood ?? null;

        this.duration = Number(datosApi.duration) || 0; // segundos
        this.releaseDate = datosApi.release_date ?? null;
        this.description = datosApi.description ?? null;

        this.valoracion = null;
        this.comentario = "";
        this.fechaGuardado = null;
    }

    getImagen(tamano = "480x480")
    {
        const a = this.artwork;
        return a?.[tamano] ?? a?.["480x480"] ?? a?.["150x150"] ?? a?.["1000x1000"] ?? IMAGEN_POR_DEFECTO;
    }

    get imagen()
    {
        return this.getImagen();
    }

    /** Duración en formato m:ss */
    get duracionMin() 
    {
        const min = Math.floor(this.duration / 60);
        const seg = String(this.duration % 60).padStart(2, "0");
        return `${min}:${seg}`;
    }

    /** Fecha legible o texto de respaldo */
    static formatearFecha(iso) 
    {
        if (!iso) return "—";
        const fecha = new Date(iso);
        return isNaN(fecha) ? "—" : fecha.toLocaleDateString("es-ES");
    }

    
    /** Tarjeta resumida  */
    toHTML()
    {
        const v = Number(this.valoracion);
        const estrellas = v
            ? `<p class="item-valoracion">${"★".repeat(v)}${"☆".repeat(5 - v)}</p>`
            : "";

        return `
            <article class="item-card" data-id="${escapeHTML(this.id)}">
                <img src="${escapeHTML(this.getImagen("150x150"))}"
                    alt="Portada de ${escapeHTML(this.title)}" loading="lazy" ${ON_ERROR_IMG}>
                <h3 class="item-titulo">${escapeHTML(this.title)}</h3>
                <p class="item-artista">${escapeHTML(this.nombreArtista)}</p>
                <p class="item-meta">${escapeHTML(this.genre ?? "Sin género")} · ${this.duracionMin}</p>
                ${estrellas}
            </article>`;
    }


    toDetalleHTML()
    {
        const v = Number(this.valoracion);
        const opciones = [1, 2, 3, 4, 5]
            .map((n) => `<option value="${n}" ${v === n ? "selected" : ""}>${n}</option>`)
            .join("");

        const campos = [
            ["Artista", escapeHTML(this.nombreArtista)],
            ["Género", escapeHTML(this.genre ?? "—")],
            ["Mood", escapeHTML(this.mood ?? "—")],
            ["Duración", this.duracionMin],
            ["Publicación", Item.formatearFecha(this.releaseDate)],
            ["Descripción", escapeHTML(this.description ?? "Sin descripción")],
        ];

        if (this.fechaGuardado)
        {
            campos.push(["Guardado el", Item.formatearFecha(this.fechaGuardado)]);
        }

        const lista = campos
            .map(([etiqueta, valor]) => `<li><strong>${etiqueta}:</strong> ${valor}</li>`)
            .join("");

        return `
            <div class="item-detalle" data-id="${escapeHTML(this.id)}">
                <img src="${escapeHTML(this.getImagen("480x480"))}"
                    alt="Portada de ${escapeHTML(this.title)}" ${ON_ERROR_IMG}>
                <h2>${escapeHTML(this.title)}</h2>

                <ul class="item-detalle-lista">
                    ${lista}
                </ul>

                <label for="detalle-valoracion">Valoración (1-5)</label>
                <select id="detalle-valoracion">
                    <option value="">Sin valorar</option>
                    ${opciones}
                </select>

                <label for="detalle-comentario">Comentario</label>
                <textarea id="detalle-comentario" rows="3">${escapeHTML(this.comentario)}</textarea>

                <button type="button" id="btn-guardar">Guardar en colección</button>
            </div>`;
    }

    toStorageObject()
    {
        return {
            id: this.id,
            title: this.title,
            nombreArtista: this.nombreArtista,
            artwork: this.artwork,
            genre: this.genre,
            mood: this.mood,
            duration: this.duration,
            releaseDate: this.releaseDate,
            description: this.description,
            valoracion: this.valoracion,
            comentario: this.comentario,
            fechaGuardado: this.fechaGuardado,
        };
    }

    static fromStorageObject(obj)
    {
        const item = new Item();
        item.id = obj.id;
        item.title = obj.title;
        item.nombreArtista = obj.nombreArtista;
        item.artwork = obj.artwork ?? null;
        item.genre = obj.genre;
        item.mood = obj.mood;
        item.duration = Number(obj.duration) || 0;
        item.releaseDate = obj.releaseDate;
        item.description = obj.description;
        
        // La valoración siempre es número (o null), nunca texto
        item.valoracion = obj.valoracion == null || obj.valoracion === "" ? null : Number(obj.valoracion);
        item.comentario = obj.comentario ?? "";
        item.fechaGuardado = obj.fechaGuardado ?? null;
        return item;
    }

}