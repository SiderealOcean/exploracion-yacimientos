# Exploración de Yacimientos Petroleros

Experiencia web interactiva que ilustra tres algoritmos evolutivos (ES, CMA-ES, DE) sobre la función Rastrigin 2D, narrada en cinco actos.

Sin frameworks, sin bundler, sin `npm install`. Solo HTML, CSS y JavaScript vanilla con ES Modules.

## Requisitos

- Un navegador moderno (Chrome, Firefox, Edge, Safari recientes).
- Python 3 **o** cualquier servidor HTTP estático (ver abajo).

> **Nota:** abrir `index.html` con doble-click **no funciona** porque el proyecto usa ES Modules, que los navegadores bloquean bajo el esquema `file://`. Hay que servirlo por HTTP.

## Cómo ejecutar

### Opción 1 — script incluido sin caché (recomendado para desarrollo)

```bash
python3 server.py
```

Luego abrir <http://localhost:8080> en el navegador.

El script sirve el directorio actual en el puerto 8080, **desactiva la caché** (envía `Cache-Control: no-store, no-cache, must-revalidate`, `Pragma: no-cache` y `Expires: 0` en cada respuesta) y silencia los logs. Así cada recarga trae los archivos frescos — sin necesidad de `Ctrl+Shift+R` ni DevTools abiertas.

Si el puerto 8080 está ocupado, pasar otro como argumento:

```bash
python3 server.py 8081
```

Para liberar el puerto si quedó colgado: `lsof -ti:8080 | xargs -r kill -9`.

### Opción 2 — servidor HTTP estándar de Python (con caché)

```bash
python3 -m http.server 8080
```

`http.server` **sí cachea**. Para evitarlo en el navegador: abrir DevTools → pestaña *Network* → marcar *Disable cache* (solo activo mientras DevTools esté abierta). Alternativa: recargar con `Ctrl+Shift+R` (Linux/Windows) o `Cmd+Shift+R` (Mac).

### Opción 3 — Node sin caché

```bash
npx serve . -p 8080 --no-clipboard -c '{"headers":[{"source":"**/*","headers":[{"key":"Cache-Control","value":"no-store"}]}]}'
```

O más simple con `http-server`:

```bash
npx http-server . -p 8080 -c-1
```

El flag `-c-1` desactiva la caché (`Cache-Control: max-age=-1`).

## Uso

- **Navegación:** botones `◀ Anterior` / `Siguiente ▶` o teclas `←` / `→`.
- **Play/Pause:** botón o `Space`.
- **Step:** botón o tecla `S`.
- **Reset:** botón o tecla `R`.
- **Velocidad:** selector `0.5x / 1x / 2x / 4x`.
- Cada acto expone sliders propios (σ, μ, λ, F, CR, NP, seed) en el panel lateral.

## Estructura

Ver `CLAUDE.md` (local) para la arquitectura completa, paleta, reglas de implementación y checklist de QA.

## Modo offline

Los vendors (`p5.min.js`, `gsap.min.js`) están en `vendor/`, así que la experiencia funciona sin conexión una vez servida localmente. Las fuentes de Google se degradan a `Georgia` / `system-ui` si no hay red.
