# Melodex

Aplicación web desarrollada para la asignatura **Sistemas Web**.

## Descripción

Melodex permite buscar canciones en la API pública de Audius y guardarlas en una colección personal con una valoración y un comentario.

## API utilizada

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
- La colección personal se guarda en el navegador mediante `localStorage`.
- La aplicación debe ejecutarse mediante HTTP para que la carga de plantillas funcione correctamente.

## Ejecución

Servir la carpeta del proyecto mediante una de estas opciones:

- Utilizar la extensión **Live Server** de VS Code.
- Ejecutar desde la carpeta del proyecto:

```bash
npx serve