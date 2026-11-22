# Melodex

Aplicación web desarrollada para la asignatura **Sistemas Web**.

## Descripción

Melodex es una aplicación web que permite buscar canciones utilizando la API pública de Audius y guardarlas en una colección personal.
Los usuarios pueden consultar información sobre las canciones, asignarles una valoración y un comentario, gestionar su colección y visualizar las estadísticas sobre las canciones guardadas.
Además, permite cambiar entre modo claro y oscuro, conservando las preferencias del usuario.

## Funcionalidades

- **Búsqueda de canciones:** permite buscar canciones por título o artista utilizando la API de Audius.
- **Información de canciones:** muestra el título, artista, portada y otros detalles de cada canción.
- **Colección personal:** permite guardar canciones con una valoración del 1 al 5 y un comentario, evitando duplicados.
- **Almacenamiento local:** conserva las canciones guardadas mediante `localStorage`, incluso después de cerrar el navegador.
- **Gestión de la colección:** permite consultar, editar y eliminar canciones, además de vaciar la colección con confirmación.
- **Filtros y ordenación:** permite buscar canciones guardadas por título o artista, filtrarlas por género y valoración mínima, y ordenarlas según diferentes criterios.
- **Sorpréndeme (extra sin IA):** permite seleccionar aleatoriamente una canción de la colección personal, respetando los filtros activos y evitando repetir la canción seleccionada cuando hay varias disponibles.
- **Estadísticas:** muestra el número total de canciones, la valoración media, las canciones mejor y peor valoradas y la distribución por género.
- **Personalización:** permite cambiar entre modo claro y oscuro, guardando la preferencia del usuario.

## API utilizada

Melodex utiliza la API pública de Audius para buscar canciones y obtener información sobre ellas, como el título, artista, género, duración e imagen de portada.
- **Nombre:** Audius
- **Documentación:** https://docs.audius.co/api
- **URL base:** `https://api.audius.co/v1`

## Integrantes - Grupo 9

- Giovana Baião
- Ilargi Quetzalli Matilde López
- Patrícia Nathália Fogo Chinato
- Roberto Rodriguez Paredes

## Tecnologías

- HTML
- CSS
- JavaScript
- Audius API
- localStorage

## Decisiones técnicas

- Las plantillas HTML se guardan en la carpeta `templates/` y se cargan con `fetch`.
- `INICIALIZADORES`, definido en `js/app.js`, contiene las funciones que se ejecutan después de cargar cada plantilla.
- El código JavaScript se organiza en diferentes módulos dentro de la carpeta `js/`, separando las funcionalidades de la aplicación.
- La colección personal se guarda en el navegador mediante `localStorage`.
- La aplicación utiliza `localStorage` para conservar también las preferencias del modo claro y oscuro.
- La aplicación debe ejecutarse mediante HTTP para que la carga de plantillas funcione correctamente.

## Ejecución

Para ejecutar Melodex es necesario utilizar un servidor local, ya que las plantillas HTML se cargan mediante `fetch`.
Existen dos opciones para iniciar la aplicación:

### Opción 1: Live Server

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Instalar la extensión **Live Server**, si todavía no está instalada.
4. Abrir el archivo `index.html`.
5. Hacer clic en **Go Live** para iniciar la aplicación en el navegador.

### Opción 2: npx serve

1. Tener instalado Node.js.
2. Abrir una terminal en la carpeta del proyecto.
3. Ejecutar el siguiente comando:

```bash
npx serve
```

4. Abrir en el navegador la dirección local que aparezca en la terminal.

No es necesario instalar una base de datos, ya que la colección de canciones se almacena en `localStorage`.