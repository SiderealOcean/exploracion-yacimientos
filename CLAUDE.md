# El Jardinero y la Flor Perfecta — CLAUDE.md

Experiencia web interactiva en un solo HTML que ilustra tres algoritmos evolutivos (ES, CMA-ES, DE) mediante metáfora narrativa. Sin frameworks. Sin bundler. Abre con doble-click.

---

## Estructura de archivos

```
jardin-evolutivo/
├── index.html
├── CLAUDE.md
├── css/
│   ├── base.css          # Reset, variables CSS, tipografía
│   ├── layout.css        # División izquierda/derecha, responsive
│   └── components.css    # Panel, sliders, botones
├── js/
│   ├── main.js           # Entry: monta canvas, conecta UI, arranca SceneManager
│   ├── core/
│   │   ├── Individual.js
│   │   ├── Population.js
│   │   ├── EvolutionaryAlgorithm.js
│   │   ├── rastrigin.js
│   │   ├── rng.js
│   │   └── math-utils.js
│   ├── algorithms/
│   │   ├── ES.js
│   │   ├── CMAES.js
│   │   └── DE.js
│   ├── render/
│   │   ├── HeatmapRenderer.js
│   │   ├── PointsRenderer.js
│   │   └── OverlayRenderer.js
│   ├── narrative/
│   │   ├── SceneManager.js
│   │   ├── Scene.js
│   │   ├── subtitles.js   # ÚNICO lugar donde vive el texto del Narrador
│   │   └── scenes/
│   │       ├── PrologueScene.js
│   │       ├── ActOneScene.js
│   │       ├── ActTwoScene.js
│   │       ├── ActThreeScene.js
│   │       └── EpilogueScene.js
│   └── ui/
│       ├── Controls.js
│       ├── NavBar.js
│       ├── SidePanel.js
│       └── SubtitleOverlay.js
└── vendor/
    ├── p5.min.js
    └── gsap.min.js
```

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla (ES Modules)
- **p5.js** (modo instancia, un solo canvas) — CDN con fallback en `vendor/`
- **GSAP** para transiciones del texto — CDN con fallback en `vendor/`
- **Google Fonts:** Fraunces + Inter, con fallback Georgia / system-ui
- Sin React, Vue, Svelte, Tailwind, jQuery, Three.js, npm

---

## Paleta

```css
:root {
  --bg-void:        #07100a;
  --bg-primary:     #0d1912;
  --bg-secondary:   #132318;
  --bg-panel:       #1a2e20;

  --heatmap-low:    #0a1f15;
  --heatmap-mid:    #2d4d3a;
  --heatmap-high:   #7ba68a;

  --point-default:  #9bb0a2;
  --point-best:     #ffd166;
  --point-selected: #ffa0c4;
  --ellipse-cmaes:  #06d6a0;
  --arrow-de:       #ef476f;

  --text-primary:   #e8f0ea;
  --text-secondary: #9bb0a2;
  --text-muted:     #5a7061;
  --text-accent:    #ffd166;
}
```

## Tipografía

- Narrador: `Fraunces` italic 400, `clamp(1.25rem, 2vw, 1.75rem)`
- Títulos de acto: `Fraunces` bold, `clamp(1.5rem, 3vw, 2.25rem)`
- UI / panel técnico: `Inter` 400/500, mínimo **16px**, `tabular-nums` en números
- Subtítulos: mínimo 18px

---

## Layout

División vertical fija: ~40% izquierda (storytelling) / ~60% derecha (canvas).
En `< 900px`: apilar texto arriba, canvas abajo.

**Izquierda:**
1. Narración del Narrador (fade in/out, una frase a la vez)
2. Panel técnico (algoritmo activo, generación, mejor fitness, parámetros)
3. Sliders por escena

**Derecha:**
- Heatmap Rastrigin (fondo fijo, precomputado una sola vez)
- 30 puntos (población)
- Overlays por algoritmo: elipse CMA-ES / flechas DE / círculo ES
- Un punto dorado: el mejor individuo
- Controles de navegación debajo del canvas

---

## Función objetivo

```javascript
// rastrigin.js — Rastrigin 2D, dominio [-5.12, 5.12]²
// Mínimo global en (0, 0) con valor 0
export function rastrigin(x, y) {
  const A = 10;
  return 2 * A
    + (x * x - A * Math.cos(2 * Math.PI * x))
    + (y * y - A * Math.cos(2 * Math.PI * y));
}
```

## RNG determinista

```javascript
// rng.js — Mulberry32
export function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Gaussian sampling: Box-Muller usando este RNG sembrado.
```

---

## Flujo narrativo

5 actos, navegación con `Siguiente ▶` / `◀ Anterior` o teclas `→` / `←`.
Transiciones: fade del texto + fade de overlays. La nube de puntos persiste, reseteada con el mismo seed.

| Acto | Algoritmo | Seed default | Target fitness |
|------|-----------|--------------|----------------|
| Prólogo | — | 42 | — |
| I | (μ,λ)-ES | 42 | ~0.24 tras 180 gen |
| II | CMA-ES (rank-1) | 42 | < 0.01 en ~42 gen |
| III | DE/rand/1/bin | 42 | ~75 gen |
| Epílogo | — | — | — |

Los tres actos usan **la misma población inicial** (seed=42) para comparación justa.

---

## Controles por escena

| Escena | Sliders activos |
|--------|-----------------|
| Prólogo | ninguno |
| Acto I (ES) | σ 0.01–2.0, μ 5–20, λ 10–40, toggle (μ,λ)/(μ+λ), seed |
| Acto II (CMA-ES) | λ 10–40, toggle "mostrar elipse", seed |
| Acto III (DE) | F 0.1–2.0, CR 0.1–1.0, NP 10–40, seed |
| Epílogo | botones: "Volver al prólogo", "Sembrar de nuevo" |

**Controles globales (siempre presentes):**
`▶ Play / ⏸ Pause` · `⏯ Step` · `↺ Reset` · `◀ Anterior` / `Siguiente ▶` · velocidad [0.5x, 1x, 2x, 4x]

**Teclado:** `Space` = Play/Pause · `→/←` = siguiente/anterior escena · `S` = step · `R` = reset

---

## Reglas de implementación

- **Ningún archivo JS supera 250 líneas.** Partir si es necesario.
- **Ningún archivo CSS supera 200 líneas.**
- La lógica evolutiva es **pura**: no toca DOM. Los renderers leen estado, nunca lo mutan.
- Todos los textos del Narrador viven únicamente en `subtitles.js`.
- El heatmap se precomputa una sola vez como `p5.Image`. No recalcular por frame.
- FPS capado a 30.
- Población máxima: 60 individuos.
- Generaciones máximas: 500 (corte duro).
- Sin `eval()`, `new Function()`, ni `innerHTML` con datos dinámicos.
- El único input numérico libre (seed) se valida con `parseInt` + rango acotado.

---

## Seguridad

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;">
```

Sin cookies, tracking ni analytics. `localStorage` solo para seed preferido (con try/catch).

---

## Anti scope-creep — NO construir

- Flores dibujadas, jardinero SVG, iconos custom, animaciones decorativas. Solo puntos y heatmap.
- Audio.
- Funciones objetivo adicionales (solo Rastrigin).
- Dimensiones > 2D.
- Backend, API, base de datos.
- Tests automatizados.
- CMA-ES con rank-μ update (rank-1 es suficiente).
- Web Workers, OffscreenCanvas.
- Internacionalización (español puro).

---

## Orden de implementación

1. Scaffold: carpetas, `index.html`, layout CSS, paleta, responsive
2. Núcleo matemático: `rastrigin.js`, `rng.js`, `math-utils.js`, `Individual.js`, `Population.js`, `EvolutionaryAlgorithm.js`
3. Renderers: `HeatmapRenderer` (precomputado), `PointsRenderer`
4. `SceneManager` + Prólogo
5. Acto I (ES): algoritmo + escena
6. Acto II (CMA-ES): algoritmo + elipse en `OverlayRenderer`
7. Acto III (DE): algoritmo + flechas paso a paso
8. Epílogo: animación final + botones reset
9. Pulido: subtítulos, timings, easings
10. QA manual completo

---

## QA — checklist antes de declarar terminado

- [ ] `index.html` abre con doble-click sin servidor
- [ ] Modo avión: funciona con fallbacks locales en `vendor/`
- [ ] Con seed=42, los tres algoritmos reproducen exactamente el mismo resultado en dos ejecuciones
- [ ] Zoom a 1280×720: todo legible, elipse visible, heatmap distinguible
- [ ] Transiciones entre actos: fade suave, sin flash brusco
- [ ] Navegación con teclado funciona en los 5 actos
- [ ] Ningún archivo JS supera 250 líneas
- [ ] Ningún archivo CSS supera 200 líneas
- [ ] Sin `eval()`, `new Function()`, ni `innerHTML` con datos dinámicos
- [ ] Tipografía: mínimo 16px en UI, 18px en subtítulos
- [ ] FPS capado a 30
- [ ] Población máxima 60, generaciones máximas 500
- [ ] Responsive: < 900px apila texto arriba / canvas abajo sin romper

---

## Criterio de éxito

Un alumno de maestría sin conocer los algoritmos, tras 6–8 minutos con la experiencia, puede decir:

> *"Uno siembra al azar. Otro aprende una forma. El último usa a sus hermanas."*
