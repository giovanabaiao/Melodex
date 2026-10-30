# Guía: crear una branch, trabajar y hacer un Pull Request

## 1. Actualizar `main`

Antes de crear una branch:

```bash
git switch main
git pull origin main
```

Comprueba el estado:

```bash
git status
```

Debe aparecer:

```text
nothing to commit, working tree clean
```

## 2. Crear la branch

Ejemplo:

```bash
git switch -c feature/item
```

Esto crea la branch y cambia a ella.

Comprueba la branch actual:

```bash
git branch
```

La branch activa aparece con `*`:

```text
  main
* feature/item
```

## 3. Publicarla en GitHub

```bash
git push -u origin feature/item
```

Solo es necesario utilizar `-u` la primera vez.

## 4. Trabajar en la tarea

Modifica únicamente los archivos relacionados con tus issues.

Comprueba los cambios:

```bash
git status
```

Añade los archivos:

```bash
git add js/item.js
```

O añade todos los cambios:

```bash
git add .
```

Crea un commit:

```bash
git commit -m "feat: implementar la clase Item"
```

Sube los cambios:

```bash
git push
```

Haz commits pequeños. Ejemplo:

```bash
git commit -m "feat: añadir constructor de Item"
git commit -m "feat: añadir método toHTML"
git commit -m "feat: añadir conversión para localStorage"
```

## 5. Actualizar la branch antes del Pull Request

Primero, asegúrate de haber guardado y enviado tus cambios:

```bash
git status
git push
```

Actualiza `main`:

```bash
git switch main
git pull origin main
```

Vuelve a tu branch:

```bash
git switch feature/item
```

Integra los cambios recientes de `main`:

```bash
git merge main
```

Si aparecen conflictos, resuélvelos, prueba la aplicación y crea otro commit:

```bash
git add .
git commit -m "fix: resolver conflictos con main"
git push
```

## 6. Probar antes del Pull Request

Comprueba:

- La funcionalidad cumple las issues.
- No aparecen errores en la consola.
- No se han modificado archivos innecesarios.
- Los nombres son claros.
- La aplicación continúa funcionando.
- La branch está actualizada con `main`.

## 7. Crear el Pull Request

En GitHub:

1. Abre el repositorio.
2. Entra en **Pull requests**.
3. Pulsa **New pull request**.
4. Selecciona:

```text
base: main
compare: feature/item
```

5. Revisa los archivos modificados.
6. Escribe un título claro:

```text
Implementar la clase Item
```

7. Añade una descripción:

```text
## Cambios realizados

- Añadido el constructor de Item.
- Añadido el método toHTML().
- Añadidos los métodos para localStorage.

## Issues relacionadas

Closes #1

## Pruebas

- Creación de un Item comprobada.
- Renderizado comprobado.
- Consola sin errores.
```

8. Añade un compañero como **Reviewer**.
9. Pulsa **Create pull request**.

`Closes #1` cerrará automáticamente la issue #1 cuando el Pull Request sea integrado en `main`.

## 8. Corregir cambios solicitados

Si el revisor pide correcciones, no crees otro Pull Request.

Continúa en la misma branch:

```bash
git switch feature/item
```

Realiza los cambios:

```bash
git add .
git commit -m "fix: aplicar cambios de la revisión"
git push
```

El Pull Request se actualizará automáticamente.

## 9. Integrar el Pull Request

Cuando el revisor lo apruebe:

1. Pulsa **Merge pull request**.
2. Confirma el merge.
3. Comprueba que las issues se hayan cerrado.

No integres un Pull Request con errores o sin revisión.

## 10. Actualizar tu proyecto después del merge

```bash
git switch main
git pull origin main
```

Después puedes eliminar la branch local:

```bash
git branch -d feature/item
```

También puedes eliminarla de GitHub:

```bash
git push origin --delete feature/item
```

## Flujo resumido

```text
Actualizar main
      ↓
Crear branch
      ↓
Modificar código
      ↓
Commit y push
      ↓
Actualizar con main
      ↓
Probar
      ↓
Crear Pull Request
      ↓
Revisión
      ↓
Merge
      ↓
Actualizar main
```