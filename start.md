# EL JARDINERO Y LA FLOR PERFECTA — v2 (simplificada)

> Experiencia web interactiva en un solo HTML.
> Metáfora narrativa de los algoritmos evolutivos **ES, CMA-ES y DE**.
>
> Este documento es **el guión y el prompt para Claude Code CLI**.
> Versión simplificada: la metáfora vive en el texto; la animación es directa y matemática.

---

## 📜 PREMISA

Un jardinero quiere cultivar **la flor perfecta**. No sabe cómo. Descubre tres formas de buscar. Cada forma es un algoritmo evolutivo.

La metáfora vive **en la voz del Narrador** (lado izquierdo).
La matemática vive **en la pantalla** (lado derecho): un terreno con puntos que se mueven.

---

## 🎭 TONO

- **Sobrio, contemplativo.** Poético sin ser recargado.
- **El Narrador es voz en off** (texto en pantalla, nunca audio).
- **No se usan términos técnicos en la narración** ("algoritmo", "función", "matriz" nunca aparecen en el texto del Narrador). Esos viven en el panel técnico.
- Lenguaje: español neutro, frases cortas.

---

## 🖼 LAYOUT

**División vertical única (izquierda/derecha), fija en toda la experiencia:**

```
╔══════════════════════════╦═══════════════════════════════╗
║                          ║                               ║
║   LADO IZQUIERDO:        ║     LADO DERECHO:             ║
║   STORYTELLING +         ║     ANIMACIÓN                 ║
║   CONTEXTO TÉCNICO       ║                               ║
║                          ║   ┌─────────────────────┐     ║
║   ┌─ Narrador ──────┐    ║   │                     │     ║
║   │ "Una frase..."  │    ║   │   HEATMAP +         │     ║
║   └─────────────────┘    ║   │   PUNTOS MOVIÉNDOSE │     ║
║                          ║   │                     │     ║
║   ┌─ Contexto ──────┐    ║   │   (Rastrigin 2D)    │     ║
║   │ Algoritmo: ES   │    ║   │                     │     ║
║   │ Gen: 47         │    ║   └─────────────────────┘     ║
║   │ Mejor: 0.83     │    ║                               ║
║   │ σ: 0.5          │    ║   [◀] [▶ Play] [⏯] [↺] [▶]   ║
║   └─────────────────┘    ║                               ║
║                          ║                               ║
║   [Controles sliders]    ║                               ║
╚══════════════════════════╩═══════════════════════════════╝
```

**Proporción:** ~40% izquierda, ~60% derecha en desktop. En pantallas estrechas (< 900px), apilar vertical (texto arriba, animación abajo).

**Lado izquierdo (texto):**
- Arriba: **Narración del Narrador** (frases poéticas, fade in/out, una a la vez).
- Medio: **Panel técnico** (qué algoritmo está corriendo, parámetros, generación, mejor fitness).
- Abajo: **Sliders** para ajustar parámetros del algoritmo activo.

**Lado derecho (animación):**
- **Heatmap de Rastrigin** como fondo fijo (gradiente oscuro en valles, claro en crestas).
- **Puntos** representando la población (30 individuos por defecto).
- **Overlays específicos por algoritmo:**
  - ES: círculo de mutación al hover (opcional).
  - CMA-ES: **elipse de covarianza** (verde menta, rota y se estira).
  - DE: **flechas efímeras** entre 3 vectores durante el paso a paso.
- **Un punto destacado**: el mejor individuo actual (halo dorado).

**Controles de navegación (abajo del canvas):**
- `◀ Anterior` / `Siguiente ▶` para moverse entre actos.
- `▶ Play / ⏸ Pause`
- `⏯ Step`
- `↺ Reset` (con el seed actual)
- Velocidad [0.5x, 1x, 2x, 4x]

---

## 🎨 PALETA (dark + legible por Zoom)

```css
:root {
  /* Fondos */
  --bg-void:        #07100a;
  --bg-primary:     #0d1912;
  --bg-secondary:   #132318;
  --bg-panel:       #1a2e20;

  /* Heatmap Rastrigin — gradiente oscuro(mejor) → claro(peor) */
  --heatmap-low:    #0a1f15;
  --heatmap-mid:    #2d4d3a;
  --heatmap-high:   #7ba68a;

  /* Puntos y overlays */
  --point-default:  #9bb0a2;   /* gris verdoso suave */
  --point-best:     #ffd166;   /* dorado ámbar — el mejor */
  --point-selected: #ffa0c4;   /* rosa pálido — seleccionado/highlight */
  --ellipse-cmaes:  #06d6a0;   /* verde menta — la elipse */
  --arrow-de:       #ef476f;   /* coral — flechas DE */

  /* Texto */
  --text-primary:   #e8f0ea;
  --text-secondary: #9bb0a2;
  --text-muted:     #5a7061;
  --text-accent:    #ffd166;
}
```

**Tipografía:**
- Narración del Narrador: `Fraunces` italic, peso 400, tamaño `clamp(1.25rem, 2vw, 1.75rem)`.
- Títulos de acto: `Fraunces` bold, `clamp(1.5rem, 3vw, 2.25rem)`.
- Panel técnico y UI: `Inter`, peso 400/500, tamaño **mínimo 16px**, con `tabular-nums` en números.
- Fallbacks: `Georgia, serif` / `system-ui, sans-serif`.

---

## 🎬 LA OBRA (flujo narrativo continuo)

Una sola experiencia. El usuario avanza con `Siguiente ▶` o flechas del teclado. Las transiciones entre actos son **fade del texto + fade de overlays** (la nube de puntos persiste, reseteada con el mismo seed).

### PRÓLOGO — "La flor que nadie ha visto"

**Lado izquierdo (Narrador, una frase a la vez, fade suave):**

> *"Hay una flor que nadie ha visto todavía."*
>
> *"Dicen que existe."*
>
> *"Pero nadie sabe cómo cultivarla."*

**Lado derecho:**
- Heatmap de Rastrigin visible pero **oscurecido al 40%**.
- Un **único punto dorado pulsante** en (0, 0) — el mínimo global, "la flor perfecta".
- Ese punto se desvanece al terminar el prólogo.

**Panel técnico:**
- Solo muestra: *"Un terreno. Un óptimo escondido en (0, 0)."*
- Sin algoritmo aún.

**Transición:** el usuario presiona `Siguiente ▶`. El heatmap se ilumina al 100%, aparecen 30 puntos dispersos.

---

### ACTO I — "El jardinero ingenuo" *(Evolution Strategies)*

#### Escena 1.1 — "La primera siembra"

**Narrador:**
> *"El jardinero toma una semilla entre los dedos."*
>
> *"No tiene mapa. No tiene señal."*
>
> *"Solo puede sembrar."*

**Animación:**
- Aparecen **30 puntos dispersos al azar** en el heatmap (seed=42).
- Ninguno cerca del óptimo.
- El mejor actual se resalta con halo dorado.

**Panel técnico:**
```
Algoritmo: Evolution Strategies (μ, λ)-ES
Generación: 0
Mejor fitness: 12.4
Parámetros: μ=10, λ=30, σ=0.5
```

**Controles activos:** σ (slider 0.01–2.0), toggle `(μ,λ) vs (μ+λ)`, seed.

#### Escena 1.2 — "Mutar al azar"

**Narrador (rota cada ~8 segundos mientras corre la animación):**
> *"Cada temporada trae pequeñas variaciones."*
>
> *"Algunas semillas caen cerca de lo soñado."*
>
> *"Otras, más lejos."*
>
> *"El jardinero arranca lo que no sirve y guarda lo que promete."*

**Animación:**
- Cada generación (cada ~400ms a 1x):
  - Los puntos "mutan": se mueven ligeramente con ruido gaussiano de desviación σ.
  - Los peores se desvanecen (fade rápido).
  - Nacen nuevos puntos cerca de los sobrevivientes.
- Al hacer **hover sobre un punto**, mostrar círculo translúcido de radio σ (el alcance de mutación).
- El usuario puede mover el slider σ y ver cambios en vivo.

**Observación pedagógica (se muestra como tooltip o nota al pie del panel):**
> *"Con σ grande: caos, explora todo. Con σ pequeño: se estanca en el primer valle."*

#### Escena 1.3 — "La pregunta"

Después de ~180 generaciones (o cuando el usuario presione `Siguiente ▶`):

**Narrador:**
> *"Las flores son bellas."*
>
> *"Pero la flor perfecta no llega."*
>
> *"El jardinero siembra en todas direcciones por igual."*
>
> *"Gasta semillas. Gasta temporadas."*

*(Pausa de 2s, texto final en pantalla:)*

> *"¿Y si la tierra pudiera enseñarle hacia dónde sembrar?"*

**Panel técnico:** queda el resultado final visible (ej. `Mejor: 0.24 tras 180 gen`). Se guardará para comparar con CMA-ES y DE.

---

### ACTO II — "El jardinero que observa" *(CMA-ES)*

**Transición:** fade del texto. Los puntos vuelven a dispersarse (reset con seed=42, misma población inicial que ES).

#### Escena 2.1 — "La revelación"

**Narrador:**
> *"El jardinero se sienta."*
>
> *"Mira."*
>
> *"Nota algo que antes no veía:"*
>
> *"las semillas que caen juntas tienden a compartir destino."*

**Animación:**
- Los 30 puntos aparecen en sus posiciones iniciales (idénticas a las del Acto I).
- **Aparece una elipse tenue** (verde menta, alpha 30%) centrada en la media, inicialmente casi un círculo.

**Panel técnico:**
```
Algoritmo: CMA-ES (rank-1 update)
Generación: 0
Mejor fitness: 12.4
Parámetros: λ=30, σ=0.5
```

#### Escena 2.2 — "La forma que aprende"

**Narrador (rota mientras corre):**
> *"Lo que el jardinero mira comienza a tener forma."*
>
> *"Una forma que aprende."*
>
> *"Ya no siembra en todas direcciones."*
>
> *"Siembra donde la forma apunta."*

**Animación:**
- Cada generación, la elipse **rota, se estira y contrae** alineándose con el valle.
- Los puntos nacen dentro o cerca de la elipse (muestreo de la gaussiana multivariada).
- Color de elipse más visible cuando cambia de forma significativamente.

**Slider:** toggle "mostrar elipse" (on/off para ver el contraste).

#### Escena 2.3 — "El valle encontrado"

Cuando `best_fitness < 0.01` (alrededor de ~42 generaciones con seed=42):

**Animación:**
- La elipse se contrae hasta casi un punto.
- Un punto con halo dorado brilla en el centro — la flor perfecta encontrada.
- Zoom sutil al centro (CSS scale).

**Narrador:**
> *"La forma se contrajo. Encontró un lugar."*
>
> *"No era magia."*
>
> *"Era memoria."*

**Panel técnico — comparación automática:**
```
Jardinero ingenuo (ES): 180 generaciones
Jardinero que observa (CMA-ES): 42 generaciones
```

---

### ACTO III — "El jardinero de las tres hermanas" *(Differential Evolution)*

**Transición:** fade. La elipse desaparece. Los puntos se resetean con seed=42.

#### Escena 3.1 — "Tres elegidas"

**Narrador:**
> *"Este jardinero no se sienta a observar."*
>
> *"No dibuja formas en el aire."*
>
> *"Toma tres flores de su propio jardín."*
>
> *"Las mira como hermanas."*

**Animación:**
- Los 30 puntos aparecen en sus posiciones iniciales.
- **Tres puntos se iluminan con halos de colores distintos**:
  - `a` → ámbar dorado
  - `b` → coral
  - `c` → rosa pálido
- El resto baja su opacidad al 30%.

**Panel técnico:**
```
Algoritmo: Differential Evolution (DE/rand/1/bin)
Generación: 0
Parámetros: F=0.5, CR=0.9, NP=30
```

#### Escena 3.2 — "La flecha entre dos"

**Narrador:**
> *"La distancia entre dos flores es un sendero."*
>
> *"El jardinero toma ese sendero..."*
>
> *"y lo camina desde una tercera."*

**Animación paso a paso (usuario presiona `⏯ Step` para avanzar, o `▶ Play` para automático):**

1. Se dibuja **flecha coral** desde `c` hacia `b` (representa `b - c`).
2. Pausa 800ms.
3. Se dibuja **flecha desde `a`** en la misma dirección, escalada por F.
4. Al final de la flecha, aparece un **nuevo punto temblorando** (el vector mutante).
5. Crossover: con probabilidad CR, el nuevo punto toma coordenadas del mutante; si no, del original.
6. Comparación: si es mejor, reemplaza; si no, se desvanece.

**Durante Play, todo ocurre rápido pero visible (~600ms por individuo).**

#### Escena 3.3 — "La población es la brújula"

**Narrador:**
> *"No necesitó recordar."*
>
> *"No necesitó dibujar."*
>
> *"Solo necesitó a sus tres hermanas."*

**Panel técnico — comparación final:**
```
Jardinero ingenuo (ES):        180 generaciones
Jardinero que observa (CMA-ES): 42 generaciones
Jardinero de las hermanas (DE): 75 generaciones
```

---

### EPÍLOGO — "Tres caminos, una misma flor"

**Animación:** los puntos convergen visualmente en el óptimo. Se quedan ahí, pulsando suavemente.

**Narrador:**
> *"Tres jardineros."*
>
> *"Uno buscó al azar."*
>
> *"Otro aprendió una forma."*
>
> *"El último miró a sus hermanas."*
>
> *"Cada uno encontró la flor a su manera."*

*(Pausa)*

> *"¿Cuál fue el camino correcto?"*
>
> *"Depende del jardín."*

**Controles finales:** botón **"Volver al prólogo"** (reset total) y **"Sembrar de nuevo"** (nuevo seed aleatorio).

---

# 🛠 NOTAS DE PRODUCCIÓN

## Stack

- **HTML5 + CSS3 + JavaScript vanilla (ES Modules).**
- **p5.js** (un solo canvas, modo instancia) — CDN con fallback local.
- **GSAP** para transiciones del texto narrativo (fade in/out coordinado) — CDN con fallback.
- **Google Fonts:** Fraunces + Inter, con fallback a Georgia / system-ui.
- **Sin frameworks, sin bundlers, sin npm install.**
- Abrir `index.html` con doble-click debe funcionar.

## Estructura de archivos

```
jardin-evolutivo/
├── index.html                  # Único entry point
├── CLAUDE.md                   # Reglas del proyecto (ver abajo)
│
├── css/
│   ├── base.css                # Reset, variables, tipografía
│   ├── layout.css              # División izquierda/derecha, responsive
│   └── components.css          # Panel, sliders, botones, subtítulos
│
├── js/
│   ├── main.js                 # Entry: monta canvas, wires UI, arranca SceneManager
│   │
│   ├── core/
│   │   ├── Individual.js           # [x, y], fitness
│   │   ├── Population.js           # colección + best(), mean(), sortByFitness()
│   │   ├── EvolutionaryAlgorithm.js # clase base abstracta
│   │   ├── rastrigin.js            # fitness(x, y)
│   │   ├── rng.js                  # Mulberry32 + gaussian (Box-Muller)
│   │   └── math-utils.js           # clamp, lerp, mapRange
│   │
│   ├── algorithms/
│   │   ├── ES.js                   # (μ,λ)-ES y (μ+λ)-ES
│   │   ├── CMAES.js                # rank-1 update
│   │   └── DE.js                   # DE/rand/1/bin
│   │
│   ├── render/
│   │   ├── HeatmapRenderer.js      # Rastrigin como imagen precomputada
│   │   ├── PointsRenderer.js       # Dibuja los puntos de la población
│   │   └── OverlayRenderer.js      # Elipse CMA-ES, flechas DE, halos
│   │
│   ├── narrative/
│   │   ├── SceneManager.js         # Stack de escenas + transiciones
│   │   ├── Scene.js                # Clase base: enter(), update(dt), exit()
│   │   ├── subtitles.js            # Textos del Narrador centralizados
│   │   └── scenes/
│   │       ├── PrologueScene.js
│   │       ├── ActOneScene.js
│   │       ├── ActTwoScene.js
│   │       ├── ActThreeScene.js
│   │       └── EpilogueScene.js
│   │
│   └── ui/
│       ├── Controls.js             # Play/Pause/Step/Reset/velocidad
│       ├── NavBar.js               # Anterior/Siguiente acto
│       ├── SidePanel.js            # Narrador + panel técnico + sliders
│       └── SubtitleOverlay.js      # Fade in/out de la narración
│
└── vendor/
    ├── p5.min.js                   # Fallback offline
    └── gsap.min.js                 # Fallback offline
```

**Reglas estrictas:**
- Ningún archivo JS supera ~250 líneas.
- La lógica evolutiva es **pura** (no toca DOM). Los renderers leen el estado, nunca lo mutan.
- Todos los textos del Narrador viven en `subtitles.js`. Cambiar narración = editar un solo archivo.

## Función objetivo

```javascript
// Rastrigin 2D, dominio [-5.12, 5.12]²
// Mínimo global en (0, 0) con valor 0
export function rastrigin(x, y) {
  const A = 10;
  return 2 * A
    + (x * x - A * Math.cos(2 * Math.PI * x))
    + (y * y - A * Math.cos(2 * Math.PI * y));
}
```

## RNG determinista (Mulberry32)

```javascript
export function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Gaussian sampling via Box-Muller usando el RNG sembrado.
```

## Renderizado del heatmap

**Precomputar una sola vez** al arrancar:
- Crear un `p5.Image` del tamaño del canvas derecho.
- Para cada pixel, calcular `rastrigin(x, y)` con coordenadas mapeadas a `[-5.12, 5.12]`.
- Mapear el valor a un color en el gradiente `--heatmap-low` → `--heatmap-mid` → `--heatmap-high`.
- Guardar la imagen; redibujarla como fondo en cada frame (barato).

**No recalcular el heatmap por frame.** Es inmutable.

## Renderizado de puntos

- Círculos sólidos de radio 6–8px.
- Color base: `--point-default`.
- El mejor actual: `--point-best` con halo radial.
- Los seleccionados en DE (a, b, c): colores especiales del CSS.
- **Transiciones suaves** entre posiciones (GSAP o lerp manual a 30fps).

## Controles por escena

| Escena | Sliders activos |
|--------|-----------------|
| Prólogo | ninguno |
| Acto I (ES) | σ (0.01–2.0), μ (5–20), λ (10–40), toggle (μ,λ)/(μ+λ), seed |
| Acto II (CMA-ES) | λ (10–40), toggle "mostrar elipse", seed |
| Acto III (DE) | F (0.1–2.0), CR (0.1–1.0), NP (10–40), seed |
| Epílogo | solo botones: "Volver al prólogo", "Sembrar de nuevo" |

**Controles globales (siempre presentes):**
- `▶ Play / ⏸ Pause`
- `⏯ Step`
- `↺ Reset` (con seed actual)
- `◀ Anterior` / `Siguiente ▶`
- Velocidad: [0.5x, 1x, 2x, 4x]

**Atajos de teclado:**
- `Space` = Play/Pause
- `→` / `←` = siguiente / anterior escena
- `S` = step
- `R` = reset

## QA — checklist antes de declarar terminado

- [ ] Abrir `index.html` con doble-click funciona sin servidor.
- [ ] Modo avión (sin internet): funciona con fallbacks locales.
- [ ] Con seed=42, los tres algoritmos producen **exactamente** el mismo resultado dos ejecuciones seguidas.
- [ ] Zoom share screen a 1280×720: todo el texto legible, elipse visible, heatmap distinguible.
- [ ] Transiciones entre actos son fluidas (fade del texto, no flash brusco).
- [ ] Navegación con teclado funciona en los 5 actos.
- [ ] Ningún archivo JS supera 250 líneas.
- [ ] Ningún archivo CSS supera 200 líneas.
- [ ] No hay `eval()`, `new Function()`, ni `innerHTML` con datos dinámicos.
- [ ] Tipografía mínima 16px en UI, 18px en subtítulos.
- [ ] FPS capado a 30.
- [ ] Población máxima: 60 individuos (más no aporta).
- [ ] Generaciones máximas: 500 (corte duro).
- [ ] Responsive: a < 900px de ancho, apilar texto arriba / canvas abajo sin romper.

## Seguridad

- CSP en `<head>`:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;">
  ```
- Todos los inputs son sliders o selectores acotados. El único input numérico (seed) se valida con `parseInt` + rango.
- Sin cookies, sin tracking, sin analytics.
- `localStorage` solo para guardar el seed preferido (opcional, con try/catch).

## Lo que NO debe construirse (anti scope-creep)

- ❌ Nada de React, Vue, Svelte, Tailwind, jQuery, Three.js.
- ❌ Nada de flores dibujadas, jardinero SVG, polen, iconos custom. **Solo puntos y heatmap.**
- ❌ Nada de audio.
- ❌ Funciones objetivo adicionales. **Solo Rastrigin.**
- ❌ Dimensiones > 2D.
- ❌ Backend, base de datos, API.
- ❌ Internacionalización. **Español puro.**
- ❌ Tests automatizados.
- ❌ CMA-ES con rank-μ update (rank-1 es suficiente).
- ❌ Web Workers, OffscreenCanvas.
- ❌ Tooltips explicativos pesados. **El Narrador es la guía.**

## Orden de implementación sugerido

1. **Scaffold:** carpetas, `index.html` con layout izquierda/derecha, paleta CSS, responsive.
2. **Núcleo matemático:** `rastrigin.js`, `rng.js`, `math-utils.js`, `Individual.js`, `Population.js`, `EvolutionaryAlgorithm.js`.
3. **Renderers:** `HeatmapRenderer` (precomputado), luego `PointsRenderer`.
4. **SceneManager + Prólogo:** infraestructura narrativa y primera escena.
5. **Acto I (ES):** algoritmo + escena + probar hasta que convenza visualmente.
6. **Acto II (CMA-ES):** algoritmo + `OverlayRenderer` para la elipse.
7. **Acto III (DE):** algoritmo + flechas paso a paso en `OverlayRenderer`.
8. **Epílogo:** animación final + botones de reset.
9. **Pulido:** subtítulos, timings, easings, consistencia.
10. **QA manual completo** con la checklist.

---

## 🌙 Criterio final de éxito

La experiencia está lista cuando un alumno de maestría, **sin conocer estos algoritmos**, la ve por Zoom durante 6–8 minutos y puede explicar con sus palabras la diferencia entre los tres jardineros:

- *"Uno siembra al azar."*
- *"Otro aprende una forma."*
- *"El último usa a sus hermanas."*

Si dice eso, la obra funcionó.

---

*Fin del guión v2.*