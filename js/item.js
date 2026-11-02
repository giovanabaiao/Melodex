// Clase que representará cada elemento obtenido de la API.
// definir la clase Item y convertir los datos de la API al modelo de la aplicación.
// guardar las propiedades de la API, la valoración, el comentario y la fecha de guardado.
// generar el HTML resumido de cada item y el panel de detalles.
// convertir un Item en un objeto preparado para localStorage y reconstruirlo desde allí.

/**
 * Clase Item: represensta una canción de la API de Audius
 * más los campos propios del usuario (valoración, comentario, fecha de guardado).
 *
 * Campos de la API :
 *   id, title, user.name, artwork, genre, mood, duration, release_date, description
 */

// Evita que texto con caracteres especiales (<, >, &, ") rompa el HTML
function escapeHTML(texto) 
{
    return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
}

const IMAGEN_POR_DEFECTO =
    "data:image/svg+xml;utf8," +
        encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">' +
        '<rect width="100%" height="100%" fill="#ddd"/>' +
        '<text x="50%" y="50%" font-size="14" text-anchor="middle" fill="#777">Sin portada</text>' +
        "</svg>"
        );

const ON_ERROR_IMG = `onerror="this.onerror=null;this.src='${IMAGEN_POR_DEFECTO}'"`;

class Item 
{
    constructor(json = {}) 
    {
        this.id = json.id ?? "";
        this.title = json.title ?? "Sin título";
        this.artista = json.user?.name ?? "Artista desconocido";
        this.imagen =
            json.artwork?.["480x480"] ??
            json.artwork?.["150x150"] ??
            json.artwork?.["1000x1000"] ??
            null;
        this.genre = json.genre ?? null;
        this.mood = json.mood ?? null;
        this.duration = Number(json.duration) || 0; 
        this.releaseDate = json.release_date ?? null;
        this.description = json.description ?? null;

        this.valoracion = json.valoracion ?? null; 
        this.comentario = json.comentario ?? "";
        this.fechaGuardado = json.fechaGuardado ?? null; 
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

    // ---------- Renderizado ----------

    toHTML() 
        {
            const valoracion = this.valoracion
                ? `<p class="item-valoracion">${"★".repeat(this.valoracion)}${"".repeat(5 - this.valoracion)}</p>`
                : "";

            return `
                <article class="item-card" data-id="${escapeHTML(this.id)}">
                    <img src="${escapeHTML(this.imagen ?? IMAGEN_POR_DEFECTO)}"
                        alt="Portada de ${escapeHTML(this.title)}" ${ON_ERROR_IMG}>
                    <h3 class="item-titulo">${escapeHTML(this.title)}</h3>
                    <p class="item-artista">${escapeHTML(this.artista)}</p>
                    <p class="item-meta">${escapeHTML(this.genre ?? "Sin género")} · ${this.duracionMin}</p>
                    ${valoracion}
                </article>`;
        }


    toDetalleHTML() 
    {
        const opciones = [1, 2, 3, 4, 5] 
            .map( (n) => `<option value="${n}" ${this.valoracion === n ? "selected" : ""}>${n}</option>` )
            .join("");

        const campos = [
            ["Artista", escapeHTML(this.artista)],
            ["Género", escapeHTML(this.genre ?? "—")],
            ["Mood", escapeHTML(this.mood ?? "—")],
            ["Duración", this.duracionMin],
            ["Publicación", Item.formatearFecha(this.releaseDate)],
            ["Descripción", escapeHTML(this.description ?? "Sin descripción")],
        ];

        if (this.fechaGuardado) {
            campos.push(["Guardado el", Item.formatearFecha(this.fechaGuardado)]);
        }

        const lista = campos
            .map(([etiqueta, valor]) => `<li><strong>${etiqueta}:</strong> ${valor}</li>`)
            .join("");

        return `
            <div class="item-detalle" data-id="${escapeHTML(this.id)}">
                <img src="${escapeHTML(this.imagen ?? IMAGEN_POR_DEFECTO)}"
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
        artista: this.artista,
        imagen: this.imagen,
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
        item.artista = obj.artista;
        item.imagen = obj.imagen;
        item.genre = obj.genre;
        item.mood = obj.mood;
        item.duration = obj.duration;
        item.releaseDate = obj.releaseDate;
        item.description = obj.description;
        item.valoracion = obj.valoracion;
        item.comentario = obj.comentario;
        item.fechaGuardado = obj.fechaGuardado;
        return item;
    }

}