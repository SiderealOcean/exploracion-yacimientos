# El Jardinero y la Flor Perfecta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una experiencia web interactiva de un solo HTML que ilustra ES, CMA-ES y DE mediante metáfora narrativa poética sobre un heatmap Rastrigin 2D.

**Architecture:** División izquierda/derecha fija: panel narrativo (subtítulos + panel técnico + sliders) y canvas p5.js (heatmap precomputado + puntos + overlays). SceneManager orquesta 5 actos; lógica evolutiva pura (sin DOM); renderers leen estado sin mutarlo.

**Tech Stack:** HTML5 + CSS3 + JS vanilla (ES Modules), p5.js modo instancia, GSAP para fade de subtítulos, Google Fonts (Fraunces + Inter), sin frameworks ni bundlers.

**Nota:** La spec prohíbe tests automatizados. Cada tarea tiene verificación manual en el navegador.

---

## Mapa de archivos

```
/home/hguerra/code/new_uth/pe/
├── index.html
├── css/
│   ├── base.css          — variables CSS, reset, tipografía
│   ├── layout.css        — split izq/der, responsive <900px
│   └── components.css    — panel técnico, sliders, botones, subtítulos
├── js/
│   ├── main.js           — entry: monta p5, conecta UI, arranca SceneManager
│   ├── core/
│   │   ├── rastrigin.js          — export function rastrigin(x,y)
│   │   ├── rng.js                — export mulberry32(seed), gaussian(rng)
│   │   ├── math-utils.js         — export clamp, lerp, mapRange, worldToCanvas, canvasToWorld
│   │   ├── Individual.js         — class Individual {x, y, fitness}
│   │   ├── Population.js         — class Population {individuals[], best(), mean(), sortByFitness()}
│   │   └── EvolutionaryAlgorithm.js — clase base abstracta {population, step(), reset(seed)}
│   ├── algorithms/
│   │   ├── ES.js     — class ES extends EvolutionaryAlgorithm {mu, lambda, sigma, plusMode}
│   │   ├── CMAES.js  — class CMAES extends EvolutionaryAlgorithm {lambda, sigma, C, m, pc, ps, ...}
│   │   └── DE.js     — class DE extends EvolutionaryAlgorithm {F, CR, NP; stepInfo:{a,b,c,mutant,trial}}
│   ├── render/
│   │   ├── HeatmapRenderer.js    — precomputa p5.Image una vez, draw(p5)
│   │   ├── PointsRenderer.js     — draw(p5, population, hoveredIdx)
│   │   └── OverlayRenderer.js    — drawEllipse(p5, cmaes), drawArrows(p5, deInfo), drawMutationCircle(p5, pt, sigma)
│   ├── narrative/
│   │   ├── subtitles.js          — export SUBTITLES {prologue, act1, act2, act3, epilogue}
│   │   ├── Scene.js              — class Scene {enter(state), update(dt, state), exit()}
│   │   ├── SceneManager.js       — class SceneManager {scenes[], current, next(), prev(), goto(i)}
│   │   └── scenes/
│   │       ├── PrologueScene.js
│   │       ├── ActOneScene.js
│   │       ├── ActTwoScene.js
│   │       ├── ActThreeScene.js
│   │       └── EpilogueScene.js
│   └── ui/
│       ├── SubtitleOverlay.js    — fade in/out GSAP de frases del Narrador
│       ├── SidePanel.js          — actualiza panel técnico + sliders por escena
│       ├── Controls.js           — Play/Pause/Step/Reset/velocidad
│       └── NavBar.js             — Anterior/Siguiente + teclado
└── vendor/
    ├── p5.min.js
    └── gsap.min.js
```

---

## Task 1: Scaffold — directorios, vendor, index.html skeleton

**Files:**
- Create: `index.html`
- Create: `css/base.css`, `css/layout.css`, `css/components.css`
- Create: `vendor/p5.min.js`, `vendor/gsap.min.js`
- Create: `js/main.js` (stub vacío)

- [ ] **Step 1.1: Descargar vendor files**

```bash
cd /home/hguerra/code/new_uth/pe
mkdir -p vendor css js/core js/algorithms js/render js/narrative/scenes js/ui
curl -L "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js" -o vendor/p5.min.js
curl -L "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" -o vendor/gsap.min.js
echo "Sizes:" && ls -lh vendor/
```

Esperado: dos archivos en `vendor/`, p5 ~900KB, gsap ~60KB.

- [ ] **Step 1.2: Crear `css/base.css`**

```css
/* css/base.css */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,400&family=Inter:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

html, body {
  height: 100%;
  background: var(--bg-void);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  overflow: hidden;
}

.narrator-text {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  color: var(--text-primary);
  line-height: 1.6;
  min-font-size: 18px;
}

.act-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  color: var(--text-accent);
}

.mono-num {
  font-variant-numeric: tabular-nums;
  font-family: 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 1.3: Crear `css/layout.css`**

```css
/* css/layout.css */
#app {
  display: flex;
  height: 100vh;
  width: 100vw;
}

#left-panel {
  width: 40%;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-right: 1px solid var(--bg-panel);
  padding: 2rem 1.5rem 1.5rem;
  gap: 1.5rem;
  overflow-y: auto;
}

#right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-void);
  position: relative;
}

#canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#canvas-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

#controls-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-top: 1px solid var(--bg-panel);
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  #app { flex-direction: column; }
  #left-panel { width: 100%; min-width: unset; height: 45vh; overflow-y: auto; }
  #right-panel { flex: 1; }
  html, body { overflow: auto; }
}
```

- [ ] **Step 1.4: Crear `css/components.css`**

```css
/* css/components.css */
#subtitle-area {
  min-height: 8rem;
  display: flex;
  align-items: flex-start;
}

#subtitle-text {
  opacity: 0;
}

#tech-panel {
  background: var(--bg-panel);
  border-radius: 6px;
  padding: 1rem;
  font-size: 16px;
}

#tech-panel h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

#tech-panel .stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  color: var(--text-secondary);
  font-size: 16px;
}

#tech-panel .stat-row span:last-child {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

#sliders-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.slider-group label {
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
}

.slider-group label span {
  color: var(--text-accent);
  font-variant-numeric: tabular-nums;
}

.slider-group input[type="range"] {
  width: 100%;
  accent-color: var(--text-accent);
  cursor: pointer;
}

.toggle-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-toggle {
  padding: 0.3rem 0.7rem;
  background: var(--bg-secondary);
  border: 1px solid var(--bg-panel);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-toggle.active {
  background: var(--bg-panel);
  color: var(--text-accent);
  border-color: var(--text-accent);
}

/* Controls bar */
.ctrl-btn {
  padding: 0.4rem 0.9rem;
  background: var(--bg-secondary);
  border: 1px solid var(--bg-panel);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.ctrl-btn:hover { background: var(--bg-panel); }
.ctrl-btn:disabled { opacity: 0.35; cursor: default; }

.ctrl-btn.primary {
  background: var(--bg-panel);
  color: var(--text-accent);
  border-color: var(--text-accent);
  min-width: 7rem;
}

select.ctrl-select {
  background: var(--bg-secondary);
  border: 1px solid var(--bg-panel);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 15px;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
}

.note-text {
  font-size: 14px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.comparison-table {
  margin-top: 0.75rem;
  font-size: 15px;
}

.comparison-table .row {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  border-bottom: 1px solid var(--bg-secondary);
}

.comparison-table .row:last-child { border-bottom: none; }
.comparison-table .algo-name { color: var(--text-secondary); }
.comparison-table .algo-val  { color: var(--text-accent); font-variant-numeric: tabular-nums; }
```

- [ ] **Step 1.5: Crear `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;">
  <title>El Jardinero y la Flor Perfecta</title>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>
  <div id="app">
    <!-- IZQUIERDA -->
    <aside id="left-panel">
      <div id="subtitle-area">
        <p id="subtitle-text" class="narrator-text"></p>
      </div>
      <div id="tech-panel">
        <h3 id="tp-algo">—</h3>
        <div id="tp-stats"></div>
        <div id="tp-note" class="note-text"></div>
        <div id="tp-comparison" class="comparison-table"></div>
      </div>
      <div id="sliders-area"></div>
    </aside>

    <!-- DERECHA -->
    <main id="right-panel">
      <div id="canvas-container"></div>
      <div id="controls-bar">
        <button class="ctrl-btn" id="btn-prev">◀ Anterior</button>
        <button class="ctrl-btn primary" id="btn-play">▶ Play</button>
        <button class="ctrl-btn" id="btn-step">⏯ Step</button>
        <button class="ctrl-btn" id="btn-reset">↺ Reset</button>
        <button class="ctrl-btn" id="btn-next">Siguiente ▶</button>
        <select class="ctrl-select" id="sel-speed">
          <option value="0.5">0.5×</option>
          <option value="1" selected>1×</option>
          <option value="2">2×</option>
          <option value="4">4×</option>
        </select>
      </div>
    </main>
  </div>

  <!-- GSAP -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          onerror="document.write('<script src=\'vendor/gsap.min.js\'><\/script>')"></script>
  <!-- p5.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js"
          onerror="document.write('<script src=\'vendor/p5.min.js\'><\/script>')"></script>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 1.6: Crear `js/main.js` stub**

```javascript
// js/main.js — stub vacío para confirmar que los módulos cargan
console.log('main.js cargado');
```

- [ ] **Step 1.7: Verificar en navegador**

Abrir `index.html` con doble-click (o `file://`).
Esperado: fondo oscuro, dos columnas, consola dice "main.js cargado", sin errores CSP.

- [ ] **Step 1.8: Commit**

```bash
cd /home/hguerra/code/new_uth/pe
git init
git add index.html css/ js/main.js vendor/
git commit -m "feat: scaffold — layout, paleta CSS, index.html, vendor"
```

---

## Task 2: Núcleo matemático — rastrigin, rng, math-utils

**Files:**
- Create: `js/core/rastrigin.js`
- Create: `js/core/rng.js`
- Create: `js/core/math-utils.js`

- [ ] **Step 2.1: Crear `js/core/rastrigin.js`**

```javascript
// js/core/rastrigin.js
export function rastrigin(x, y) {
  const A = 10;
  return 2 * A
    + (x * x - A * Math.cos(2 * Math.PI * x))
    + (y * y - A * Math.cos(2 * Math.PI * y));
}
```

- [ ] **Step 2.2: Crear `js/core/rng.js`**

```javascript
// js/core/rng.js
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeGaussian(rng) {
  let spare = null;
  return function(mean = 0, std = 1) {
    if (spare !== null) {
      const v = spare * std + mean;
      spare = null;
      return v;
    }
    let u, v, s;
    do {
      u = rng() * 2 - 1;
      v = rng() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const mul = Math.sqrt(-2 * Math.log(s) / s);
    spare = v * mul;
    return u * mul * std + mean;
  };
}
```

- [ ] **Step 2.3: Crear `js/core/math-utils.js`**

```javascript
// js/core/math-utils.js
export const DOMAIN = 5.12;

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(v, inMin, inMax, outMin, outMax) {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function worldToCanvas(wx, wy, canvasW, canvasH) {
  return {
    cx: mapRange(wx, -DOMAIN, DOMAIN, 0, canvasW),
    cy: mapRange(wy, -DOMAIN, DOMAIN, canvasH, 0),
  };
}

export function canvasToWorld(cx, cy, canvasW, canvasH) {
  return {
    wx: mapRange(cx, 0, canvasW, -DOMAIN, DOMAIN),
    wy: mapRange(cy, canvasH, 0, -DOMAIN, DOMAIN),
  };
}
```

- [ ] **Step 2.4: Verificar en consola del navegador**

Añadir temporalmente al stub de `main.js`:
```javascript
import { rastrigin } from './core/rastrigin.js';
import { mulberry32, makeGaussian } from './core/rng.js';
import { mapRange, worldToCanvas } from './core/math-utils.js';

console.assert(rastrigin(0, 0) === 0, 'rastrigin(0,0) debe ser 0');
console.assert(Math.abs(rastrigin(1, 1) - 2) < 1e-10, 'rastrigin(1,1) debe ser 2');

const rng = mulberry32(42);
const vals = [rng(), rng(), rng()];
const rng2 = mulberry32(42);
console.assert(rng2() === vals[0], 'RNG determinista');

const { cx } = worldToCanvas(0, 0, 600, 600);
console.assert(Math.abs(cx - 300) < 1, 'worldToCanvas(0,0) debe ser centro');

console.log('Core math OK');
```

Abrir navegador, consola sin errores, ver "Core math OK".

- [ ] **Step 2.5: Revertir main.js al stub mínimo**

```javascript
// js/main.js
console.log('main.js cargado');
```

- [ ] **Step 2.6: Commit**

```bash
git add js/core/
git commit -m "feat: núcleo matemático — rastrigin, RNG mulberry32, math-utils"
```

---

## Task 3: Modelos de datos — Individual, Population, EvolutionaryAlgorithm

**Files:**
- Create: `js/core/Individual.js`
- Create: `js/core/Population.js`
- Create: `js/core/EvolutionaryAlgorithm.js`

- [ ] **Step 3.1: Crear `js/core/Individual.js`**

```javascript
// js/core/Individual.js
import { rastrigin } from './rastrigin.js';
import { clamp, DOMAIN } from './math-utils.js';

export class Individual {
  constructor(x, y) {
    this.x = clamp(x, -DOMAIN, DOMAIN);
    this.y = clamp(y, -DOMAIN, DOMAIN);
    this.fitness = rastrigin(this.x, this.y);
  }

  clone() {
    const ind = new Individual(this.x, this.y);
    ind.fitness = this.fitness;
    return ind;
  }
}
```

- [ ] **Step 3.2: Crear `js/core/Population.js`**

```javascript
// js/core/Population.js
export class Population {
  constructor(individuals = []) {
    this.individuals = individuals;
  }

  get size() { return this.individuals.length; }

  best() {
    return this.individuals.reduce((b, i) => i.fitness < b.fitness ? i : b);
  }

  mean() {
    const n = this.individuals.length;
    const mx = this.individuals.reduce((s, i) => s + i.x, 0) / n;
    const my = this.individuals.reduce((s, i) => s + i.y, 0) / n;
    return { x: mx, y: my };
  }

  sortByFitness() {
    this.individuals.sort((a, b) => a.fitness - b.fitness);
  }
}
```

- [ ] **Step 3.3: Crear `js/core/EvolutionaryAlgorithm.js`**

```javascript
// js/core/EvolutionaryAlgorithm.js
import { Individual } from './Individual.js';
import { mulberry32, makeGaussian } from './rng.js';
import { DOMAIN } from './math-utils.js';

export class EvolutionaryAlgorithm {
  constructor(params = {}) {
    this.seed = params.seed ?? 42;
    this.generation = 0;
    this.population = null;
    this._initRng();
  }

  _initRng() {
    this._rng = mulberry32(this.seed);
    this._gauss = makeGaussian(this._rng);
  }

  _randomIndividual() {
    const x = (this._rng() * 2 - 1) * DOMAIN;
    const y = (this._rng() * 2 - 1) * DOMAIN;
    return new Individual(x, y);
  }

  reset(seed = this.seed) {
    this.seed = seed;
    this.generation = 0;
    this._initRng();
    this._initPopulation();
  }

  _initPopulation() {
    throw new Error('_initPopulation() debe implementarse en subclase');
  }

  step() {
    throw new Error('step() debe implementarse en subclase');
  }

  get bestFitness() {
    return this.population ? this.population.best().fitness : Infinity;
  }
}
```

- [ ] **Step 3.4: Verificar en consola del navegador**

Actualizar `main.js` temporalmente:
```javascript
import { Individual } from './core/Individual.js';
import { Population } from './core/Population.js';

const ind = new Individual(0, 0);
console.assert(ind.fitness === 0, 'Individual(0,0).fitness === 0');

const pop = new Population([new Individual(1, 1), new Individual(0, 0), new Individual(2, 2)]);
console.assert(pop.best().fitness === 0, 'best() devuelve el de fitness 0');
console.assert(pop.size === 3, 'size === 3');

console.log('Population OK');
```

Abrir navegador, consola sin errores, ver "Population OK".

- [ ] **Step 3.5: Revertir main.js**

```javascript
console.log('main.js cargado');
```

- [ ] **Step 3.6: Commit**

```bash
git add js/core/Individual.js js/core/Population.js js/core/EvolutionaryAlgorithm.js
git commit -m "feat: modelos Individual, Population, EvolutionaryAlgorithm base"
```

---

## Task 4: Algoritmo ES

**Files:**
- Create: `js/algorithms/ES.js`

- [ ] **Step 4.1: Crear `js/algorithms/ES.js`**

```javascript
// js/algorithms/ES.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class ES extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.mu     = params.mu     ?? 10;
    this.lambda = params.lambda ?? 30;
    this.sigma  = params.sigma  ?? 0.5;
    this.plusMode = params.plusMode ?? false;
    this.reset(this.seed);
  }

  _initPopulation() {
    const inds = [];
    for (let i = 0; i < this.lambda; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
  }

  step() {
    this.population.sortByFitness();
    const parents = this.population.individuals.slice(0, this.mu);
    const offspring = [];

    for (let i = 0; i < this.lambda; i++) {
      const p = parents[i % this.mu];
      const x = clamp(p.x + this._gauss(0, this.sigma), -DOMAIN, DOMAIN);
      const y = clamp(p.y + this._gauss(0, this.sigma), -DOMAIN, DOMAIN);
      offspring.push(new Individual(x, y));
    }

    if (this.plusMode) {
      const pool = [...parents, ...offspring];
      pool.sort((a, b) => a.fitness - b.fitness);
      this.population = new Population(pool.slice(0, this.lambda));
    } else {
      this.population = new Population(offspring);
    }

    this.generation++;
  }
}
```

- [ ] **Step 4.2: Verificar convergencia en consola**

```javascript
import { ES } from './algorithms/ES.js';

const es = new ES({ seed: 42, mu: 10, lambda: 30, sigma: 0.5 });
for (let i = 0; i < 200; i++) es.step();
console.log('ES gen 200 best:', es.bestFitness.toFixed(4));
console.assert(es.bestFitness < 2, 'ES debe converger parcialmente en 200 gen');
console.log('ES OK');
```

Esperado: `ES gen 200 best: < 2.0`, "ES OK".

- [ ] **Step 4.3: Revertir main.js y commit**

```bash
git add js/algorithms/ES.js
git commit -m "feat: algoritmo (μ,λ)-ES y (μ+λ)-ES"
```

---

## Task 5: Algoritmo CMA-ES (rank-1)

**Files:**
- Create: `js/algorithms/CMAES.js`

- [ ] **Step 5.1: Crear `js/algorithms/CMAES.js`**

```javascript
// js/algorithms/CMAES.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class CMAES extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.lambda = params.lambda ?? 30;
    this.mu     = Math.floor(this.lambda / 2);
    this.sigma  = params.sigma  ?? 0.5;
    this.showEllipse = true;
    this.reset(this.seed);
  }

  _initPopulation() {
    this.m  = [0, 0];
    this.C  = [[1, 0], [0, 1]];
    this.pc = [0, 0];
    this.ps = [0, 0];
    this._weights = this._buildWeights();
    this._mueff   = this._computeMueff();

    const n = 2;
    this._cs   = (this._mueff + 2) / (n + this._mueff + 5);
    this._cc   = (4 + this._mueff / n) / (n + 4 + 2 * this._mueff / n);
    this._c1   = 2 / ((n + 1.3) ** 2 + this._mueff);
    this._cmu  = Math.min(1 - this._c1,
                   2 * (this._mueff - 2 + 1 / this._mueff) / ((n + 2) ** 2 + this._mueff));
    this._damps = 1 + 2 * Math.max(0, Math.sqrt((this._mueff - 1) / (n + 1)) - 1) + this._cs;
    this._chiN  = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));

    const inds = [];
    for (let i = 0; i < this.lambda; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
  }

  _buildWeights() {
    const w = [];
    for (let i = 0; i < this.mu; i++) w.push(Math.log(this.mu + 0.5) - Math.log(i + 1));
    const s = w.reduce((a, b) => a + b, 0);
    return w.map(x => x / s);
  }

  _computeMueff() {
    const s = this._weights.reduce((a, b) => a + b * b, 0);
    return 1 / s;
  }

  _sampleFromC() {
    const [[c00, c01], [c10, c11]] = this.C;
    const l1 = Math.sqrt(Math.max(0, c00));
    const l21 = l1 === 0 ? 0 : c10 / l1;
    const l22sq = c11 - l21 * l21;
    const l22 = Math.sqrt(Math.max(0, l22sq));

    const z1 = this._gauss();
    const z2 = this._gauss();
    return [l1 * z1, l21 * z1 + l22 * z2];
  }

  step() {
    const samples = [];
    for (let i = 0; i < this.lambda; i++) {
      const [dx, dy] = this._sampleFromC();
      const x = clamp(this.m[0] + this.sigma * dx, -DOMAIN, DOMAIN);
      const y = clamp(this.m[1] + this.sigma * dy, -DOMAIN, DOMAIN);
      samples.push({ ind: new Individual(x, y), z: [dx, dy] });
    }
    samples.sort((a, b) => a.ind.fitness - b.ind.fitness);

    const selectedInds = samples.slice(0, this.mu);

    const newM = [0, 0];
    for (let i = 0; i < this.mu; i++) {
      newM[0] += this._weights[i] * selectedInds[i].ind.x;
      newM[1] += this._weights[i] * selectedInds[i].ind.y;
    }

    const step = [(newM[0] - this.m[0]) / this.sigma, (newM[1] - this.m[1]) / this.sigma];

    const cs = this._cs, damps = this._damps, chiN = this._chiN;
    this.ps[0] = (1 - cs) * this.ps[0] + Math.sqrt(cs * (2 - cs) * this._mueff) * step[0];
    this.ps[1] = (1 - cs) * this.ps[1] + Math.sqrt(cs * (2 - cs) * this._mueff) * step[1];

    const psNorm = Math.sqrt(this.ps[0] ** 2 + this.ps[1] ** 2);
    const hsig = psNorm / chiN / Math.sqrt(1 - (1 - cs) ** (2 * (this.generation + 1))) < 1.4 + 2 / (2 + 1) ? 1 : 0;

    const cc = this._cc;
    this.pc[0] = (1 - cc) * this.pc[0] + hsig * Math.sqrt(cc * (2 - cc) * this._mueff) * step[0];
    this.pc[1] = (1 - cc) * this.pc[1] + hsig * Math.sqrt(cc * (2 - cc) * this._mueff) * step[1];

    const c1 = this._c1, cmu = this._cmu;
    const oldC = this.C;
    this.C = [
      [
        (1 - c1 - cmu) * oldC[0][0] + c1 * this.pc[0] * this.pc[0] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[0] * si.z[0], 0),
        (1 - c1 - cmu) * oldC[0][1] + c1 * this.pc[0] * this.pc[1] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[0] * si.z[1], 0),
      ],
      [
        (1 - c1 - cmu) * oldC[1][0] + c1 * this.pc[1] * this.pc[0] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[1] * si.z[0], 0),
        (1 - c1 - cmu) * oldC[1][1] + c1 * this.pc[1] * this.pc[1] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[1] * si.z[1], 0),
      ]
    ];

    this.sigma *= Math.exp((cs / damps) * (psNorm / chiN - 1));
    this.sigma = clamp(this.sigma, 1e-8, 5.0);

    this.m = newM;
    this.population = new Population(samples.map(s => s.ind));
    this.generation++;
  }

  getEllipseParams(canvasW, canvasH) {
    const { cx: mx, cy: my } = { cx: canvasW * (this.m[0] + 5.12) / 10.24, cy: canvasH * (1 - (this.m[1] + 5.12) / 10.24) };
    const scale = (canvasW / 10.24) * this.sigma * 2;
    const [[c00, c01], [, c11]] = this.C;
    const angle = Math.atan2(2 * c01, c00 - c11) / 2;
    const trace = c00 + c11;
    const det = c00 * c11 - c01 * c01;
    const disc = Math.sqrt(Math.max(0, (trace / 2) ** 2 - det));
    const l1 = Math.sqrt(Math.max(0, trace / 2 + disc)) * scale;
    const l2 = Math.sqrt(Math.max(0, trace / 2 - disc)) * scale;
    return { mx, my, angle, l1: Math.max(l1, 2), l2: Math.max(l2, 2) };
  }
}
```

- [ ] **Step 5.2: Verificar convergencia**

```javascript
import { CMAES } from './algorithms/CMAES.js';

const cma = new CMAES({ seed: 42, lambda: 30, sigma: 0.5 });
for (let i = 0; i < 80; i++) cma.step();
console.log('CMA-ES gen 80 best:', cma.bestFitness.toFixed(6));
console.assert(cma.bestFitness < 0.1, 'CMA-ES debe converger antes de gen 80');
console.log('CMA-ES OK');
```

- [ ] **Step 5.3: Commit**

```bash
git add js/algorithms/CMAES.js
git commit -m "feat: algoritmo CMA-ES rank-1"
```

---

## Task 6: Algoritmo DE

**Files:**
- Create: `js/algorithms/DE.js`

- [ ] **Step 6.1: Crear `js/algorithms/DE.js`**

```javascript
// js/algorithms/DE.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class DE extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.F  = params.F  ?? 0.5;
    this.CR = params.CR ?? 0.9;
    this.NP = params.NP ?? 30;
    this.stepInfo = null;
    this.reset(this.seed);
  }

  _initPopulation() {
    const inds = [];
    for (let i = 0; i < this.NP; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
    this.stepInfo = null;
  }

  _pickThreeDistinct(exclude) {
    const pool = [];
    for (let i = 0; i < this.NP; i++) if (i !== exclude) pool.push(i);
    const a = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    const b = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    const c = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    return [a, b, c];
  }

  step() {
    const newInds = [];
    const lastStepInfo = [];

    for (let i = 0; i < this.NP; i++) {
      const [ai, bi, ci] = this._pickThreeDistinct(i);
      const a = this.population.individuals[ai];
      const b = this.population.individuals[bi];
      const c = this.population.individuals[ci];

      const mx = clamp(a.x + this.F * (b.x - c.x), -DOMAIN, DOMAIN);
      const my = clamp(a.y + this.F * (b.y - c.y), -DOMAIN, DOMAIN);
      const mutant = new Individual(mx, my);

      const jRand = Math.floor(this._rng() * 2);
      const tx = (this._rng() < this.CR || jRand === 0) ? mutant.x : this.population.individuals[i].x;
      const ty = (this._rng() < this.CR || jRand === 1) ? mutant.y : this.population.individuals[i].y;
      const trial = new Individual(tx, ty);

      const winner = trial.fitness <= this.population.individuals[i].fitness ? trial : this.population.individuals[i];
      newInds.push(winner);
      lastStepInfo.push({ ai, bi, ci, a, b, c, mutant, trial, winner });
    }

    this.population = new Population(newInds);
    this.stepInfo = lastStepInfo;
    this.generation++;
  }
}
```

- [ ] **Step 6.2: Verificar convergencia**

```javascript
import { DE } from './algorithms/DE.js';

const de = new DE({ seed: 42, F: 0.5, CR: 0.9, NP: 30 });
for (let i = 0; i < 100; i++) de.step();
console.log('DE gen 100 best:', de.bestFitness.toFixed(4));
console.assert(de.bestFitness < 1, 'DE debe converger razonablemente en 100 gen');
console.log('DE OK');
```

- [ ] **Step 6.3: Commit**

```bash
git add js/algorithms/DE.js
git commit -m "feat: algoritmo DE/rand/1/bin"
```

---

## Task 7: Renderers — HeatmapRenderer y PointsRenderer

**Files:**
- Create: `js/render/HeatmapRenderer.js`
- Create: `js/render/PointsRenderer.js`

- [ ] **Step 7.1: Crear `js/render/HeatmapRenderer.js`**

```javascript
// js/render/HeatmapRenderer.js
import { rastrigin } from '../core/rastrigin.js';

const LOW  = [10,  31,  21];
const MID  = [45,  77,  58];
const HIGH = [123, 166, 138];

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export class HeatmapRenderer {
  constructor() {
    this._img = null;
    this._w = 0;
    this._h = 0;
    this._alpha = 255;
  }

  precompute(p5, w, h) {
    if (this._img && this._w === w && this._h === h) return;
    this._w = w; this._h = h;
    this._img = p5.createImage(w, h);
    this._img.loadPixels();

    const DOMAIN = 5.12;
    let maxVal = 0;
    const vals = new Float32Array(w * h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const wx = (px / w) * 2 * DOMAIN - DOMAIN;
        const wy = ((h - py) / h) * 2 * DOMAIN - DOMAIN;
        const v = rastrigin(wx, wy);
        vals[py * w + px] = v;
        if (v > maxVal) maxVal = v;
      }
    }

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const t = vals[py * w + px] / maxVal;
        const col = t < 0.5
          ? lerpColor(LOW, MID, t * 2)
          : lerpColor(MID, HIGH, (t - 0.5) * 2);
        const idx = (py * w + px) * 4;
        this._img.pixels[idx]   = col[0];
        this._img.pixels[idx+1] = col[1];
        this._img.pixels[idx+2] = col[2];
        this._img.pixels[idx+3] = this._alpha;
      }
    }
    this._img.updatePixels();
  }

  setAlpha(a) {
    this._alpha = a;
    this._img = null;
  }

  draw(p5) {
    if (this._img) p5.image(this._img, 0, 0, p5.width, p5.height);
  }
}
```

- [ ] **Step 7.2: Crear `js/render/PointsRenderer.js`**

```javascript
// js/render/PointsRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

const COL_DEFAULT  = [155, 176, 162];
const COL_BEST     = [255, 209, 102];
const COL_SEL_A    = [255, 209, 102];
const COL_SEL_B    = [239,  71, 111];
const COL_SEL_C    = [255, 160, 196];

export class PointsRenderer {
  constructor() {
    this.hoveredIdx = -1;
    this.highlightIndices = {};
  }

  draw(p5, population, options = {}) {
    if (!population) return;
    const best = population.best();
    const inds = population.individuals;
    const { deHighlight } = options;

    p5.noStroke();

    for (let i = 0; i < inds.length; i++) {
      const ind = inds[i];
      const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
      const isBest = ind === best;

      let col = COL_DEFAULT;
      let alpha = 255;
      let r = 7;

      if (deHighlight) {
        if (i === deHighlight.ai) col = COL_SEL_A;
        else if (i === deHighlight.bi) col = COL_SEL_B;
        else if (i === deHighlight.ci) col = COL_SEL_C;
        else { alpha = 80; }
      }

      if (isBest) { col = COL_BEST; r = 8; }

      if (isBest) {
        p5.fill(col[0], col[1], col[2], 60);
        p5.ellipse(cx, cy, r * 3.5, r * 3.5);
      }

      p5.fill(col[0], col[1], col[2], alpha);
      p5.ellipse(cx, cy, r * 2, r * 2);
    }
  }

  drawMutationCircle(p5, ind, sigma) {
    if (!ind) return;
    const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
    const pixelSigma = sigma * p5.width / 10.24;
    p5.noFill();
    p5.stroke(155, 176, 162, 80);
    p5.strokeWeight(1);
    p5.ellipse(cx, cy, pixelSigma * 2, pixelSigma * 2);
    p5.noStroke();
  }
}
```

- [ ] **Step 7.3: Smoke test visual**

Actualizar `main.js` temporalmente para mostrar el heatmap:
```javascript
import { HeatmapRenderer } from './render/HeatmapRenderer.js';
import { PointsRenderer } from './render/PointsRenderer.js';
import { ES } from './algorithms/ES.js';

const heatmap = new HeatmapRenderer();
const points  = new PointsRenderer();
const es = new ES({ seed: 42 });

new p5(function(p) {
  p.setup = function() {
    const c = document.getElementById('canvas-container');
    p.createCanvas(c.offsetWidth, c.offsetHeight).parent('canvas-container');
    p.frameRate(30);
    heatmap.precompute(p, p.width, p.height);
  };
  p.draw = function() {
    heatmap.draw(p);
    points.draw(p, es.population);
    es.step();
    if (es.generation % 30 === 0) console.log('Gen', es.generation, 'best', es.bestFitness.toFixed(3));
  };
});
```

Abrir navegador: heatmap oscuro visible, puntos moviéndose, log en consola cada 30 gens.

- [ ] **Step 7.4: Revertir main.js y commit**

```bash
git add js/render/
git commit -m "feat: HeatmapRenderer precomputado y PointsRenderer"
```

---

## Task 8: OverlayRenderer — elipse CMA-ES y flechas DE

**Files:**
- Create: `js/render/OverlayRenderer.js`

- [ ] **Step 8.1: Crear `js/render/OverlayRenderer.js`**

```javascript
// js/render/OverlayRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

export class OverlayRenderer {
  drawEllipse(p5, cmaes, alpha = 180) {
    if (!cmaes || !cmaes.showEllipse) return;
    const ep = cmaes.getEllipseParams(p5.width, p5.height);
    p5.push();
    p5.translate(ep.mx, ep.my);
    p5.rotate(ep.angle);
    p5.noFill();
    p5.stroke(6, 214, 160, alpha);
    p5.strokeWeight(1.5);
    p5.ellipse(0, 0, ep.l1 * 2, ep.l2 * 2);
    p5.pop();
  }

  drawArrows(p5, stepInfo, targetIdx = 0) {
    if (!stepInfo || !stepInfo[targetIdx]) return;
    const { a, b, c, mutant } = stepInfo[targetIdx];
    const pa = worldToCanvas(a.x, a.y, p5.width, p5.height);
    const pb = worldToCanvas(b.x, b.y, p5.width, p5.height);
    const pc = worldToCanvas(c.x, c.y, p5.width, p5.height);
    const pm = worldToCanvas(mutant.x, mutant.y, p5.width, p5.height);

    p5.strokeWeight(1.5);
    p5.stroke(239, 71, 111, 200);
    this._arrow(p5, pc.cx, pc.cy, pb.cx, pb.cy);

    p5.stroke(255, 209, 102, 200);
    const dx = pm.cx - pa.cx, dy = pm.cy - pa.cy;
    this._arrow(p5, pa.cx, pa.cy, pa.cx + dx, pa.cy + dy);

    p5.fill(255, 209, 102, 220);
    p5.noStroke();
    p5.ellipse(pm.cx, pm.cy, 10, 10);
  }

  _arrow(p5, x1, y1, x2, y2) {
    p5.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 8;
    p5.fill(p5.red(p5.color(255, 0, 0)), p5.green(p5.color(255, 0, 0)), p5.blue(p5.color(255, 0, 0)));
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.noStroke();
    const [r, g, b] = [p5.drawingContext.strokeStyle];
    p5.fill(239, 71, 111, 200);
    p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
    p5.pop();
  }
}
```

- [ ] **Step 8.2: Corregir `_arrow` para usar color de stroke correcto**

El método `_arrow` necesita propagar el color correcto. Reemplazar `_arrow`:

```javascript
  _arrow(p5, x1, y1, x2, y2, r, g, b, a) {
    p5.stroke(r, g, b, a);
    p5.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 8;
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.noStroke();
    p5.fill(r, g, b, a);
    p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
    p5.pop();
  }
```

Y actualizar las llamadas en `drawArrows`:
```javascript
    this._arrow(p5, pc.cx, pc.cy, pb.cx, pb.cy, 239, 71, 111, 200);
    this._arrow(p5, pa.cx, pa.cy, pa.cx + dx, pa.cy + dy, 255, 209, 102, 200);
```

Archivo final completo de `OverlayRenderer.js`:

```javascript
// js/render/OverlayRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

export class OverlayRenderer {
  drawEllipse(p5, cmaes, alpha = 180) {
    if (!cmaes || !cmaes.showEllipse) return;
    const ep = cmaes.getEllipseParams(p5.width, p5.height);
    p5.push();
    p5.translate(ep.mx, ep.my);
    p5.rotate(ep.angle);
    p5.noFill();
    p5.stroke(6, 214, 160, alpha);
    p5.strokeWeight(1.5);
    p5.ellipse(0, 0, ep.l1 * 2, ep.l2 * 2);
    p5.pop();
  }

  drawArrows(p5, stepInfo, targetIdx = 0) {
    if (!stepInfo || !stepInfo[targetIdx]) return;
    const { a, b, c, mutant } = stepInfo[targetIdx];
    const pa = worldToCanvas(a.x, a.y, p5.width, p5.height);
    const pb = worldToCanvas(b.x, b.y, p5.width, p5.height);
    const pc = worldToCanvas(c.x, c.y, p5.width, p5.height);
    const pm = worldToCanvas(mutant.x, mutant.y, p5.width, p5.height);

    p5.strokeWeight(1.5);
    this._arrow(p5, pc.cx, pc.cy, pb.cx, pb.cy, 239, 71, 111, 200);
    this._arrow(p5, pa.cx, pa.cy, pm.cx, pm.cy, 255, 209, 102, 200);

    p5.fill(255, 209, 102, 220);
    p5.noStroke();
    p5.ellipse(pm.cx, pm.cy, 10, 10);
  }

  _arrow(p5, x1, y1, x2, y2, r, g, b, a) {
    p5.stroke(r, g, b, a);
    p5.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 8;
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.noStroke();
    p5.fill(r, g, b, a);
    p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
    p5.pop();
  }
}
```

- [ ] **Step 8.3: Commit**

```bash
git add js/render/OverlayRenderer.js
git commit -m "feat: OverlayRenderer — elipse CMA-ES y flechas DE"
```

---

## Task 9: Subtítulos y SceneManager

**Files:**
- Create: `js/narrative/subtitles.js`
- Create: `js/narrative/Scene.js`
- Create: `js/narrative/SceneManager.js`

- [ ] **Step 9.1: Crear `js/narrative/subtitles.js`**

```javascript
// js/narrative/subtitles.js
export const SUBTITLES = {
  prologue: [
    "Hay una flor que nadie ha visto todavía.",
    "Dicen que existe.",
    "Pero nadie sabe cómo cultivarla.",
  ],
  act1: {
    title: "El jardinero ingenuo",
    s11: [
      "El jardinero toma una semilla entre los dedos.",
      "No tiene mapa. No tiene señal.",
      "Solo puede sembrar.",
    ],
    s12: [
      "Cada temporada trae pequeñas variaciones.",
      "Algunas semillas caen cerca de lo soñado.",
      "Otras, más lejos.",
      "El jardinero arranca lo que no sirve y guarda lo que promete.",
    ],
    s13: [
      "Las flores son bellas.",
      "Pero la flor perfecta no llega.",
      "El jardinero siembra en todas direcciones por igual.",
      "Gasta semillas. Gasta temporadas.",
      "¿Y si la tierra pudiera enseñarle hacia dónde sembrar?",
    ],
    note: "Con σ grande: caos, explora todo. Con σ pequeño: se estanca en el primer valle.",
  },
  act2: {
    title: "El jardinero que observa",
    s21: [
      "El jardinero se sienta.",
      "Mira.",
      "Nota algo que antes no veía:",
      "las semillas que caen juntas tienden a compartir destino.",
    ],
    s22: [
      "Lo que el jardinero mira comienza a tener forma.",
      "Una forma que aprende.",
      "Ya no siembra en todas direcciones.",
      "Siembra donde la forma apunta.",
    ],
    s23: [
      "La forma se contrajo. Encontró un lugar.",
      "No era magia.",
      "Era memoria.",
    ],
  },
  act3: {
    title: "El jardinero de las tres hermanas",
    s31: [
      "Este jardinero no se sienta a observar.",
      "No dibuja formas en el aire.",
      "Toma tres flores de su propio jardín.",
      "Las mira como hermanas.",
    ],
    s32: [
      "La distancia entre dos flores es un sendero.",
      "El jardinero toma ese sendero...",
      "y lo camina desde una tercera.",
    ],
    s33: [
      "No necesitó recordar.",
      "No necesitó dibujar.",
      "Solo necesitó a sus tres hermanas.",
    ],
  },
  epilogue: [
    "Tres jardineros.",
    "Uno buscó al azar.",
    "Otro aprendió una forma.",
    "El último miró a sus hermanas.",
    "Cada uno encontró la flor a su manera.",
    "¿Cuál fue el camino correcto?",
    "Depende del jardín.",
  ],
};
```

- [ ] **Step 9.2: Crear `js/narrative/Scene.js`**

```javascript
// js/narrative/Scene.js
export class Scene {
  constructor(name) {
    this.name = name;
  }

  enter(state) {}

  update(dt, state) {}

  exit(state) {}
}
```

- [ ] **Step 9.3: Crear `js/narrative/SceneManager.js`**

```javascript
// js/narrative/SceneManager.js
export class SceneManager {
  constructor(scenes = []) {
    this.scenes = scenes;
    this.currentIndex = 0;
    this._state = {};
  }

  get current() { return this.scenes[this.currentIndex]; }
  get total() { return this.scenes.length; }

  setState(s) { this._state = s; }
  getState() { return this._state; }

  goto(index) {
    if (index < 0 || index >= this.scenes.length) return false;
    if (this.current) this.current.exit(this._state);
    this.currentIndex = index;
    this.current.enter(this._state);
    return true;
  }

  next() { return this.goto(this.currentIndex + 1); }
  prev() { return this.goto(this.currentIndex - 1); }

  update(dt) {
    if (this.current) this.current.update(dt, this._state);
  }
}
```

- [ ] **Step 9.4: Commit**

```bash
git add js/narrative/subtitles.js js/narrative/Scene.js js/narrative/SceneManager.js
git commit -m "feat: subtitles.js, Scene base, SceneManager"
```

---

## Task 10: UI — SubtitleOverlay, Controls, NavBar, SidePanel

**Files:**
- Create: `js/ui/SubtitleOverlay.js`
- Create: `js/ui/Controls.js`
- Create: `js/ui/NavBar.js`
- Create: `js/ui/SidePanel.js`

- [ ] **Step 10.1: Crear `js/ui/SubtitleOverlay.js`**

```javascript
// js/ui/SubtitleOverlay.js
export class SubtitleOverlay {
  constructor(elementId = 'subtitle-text') {
    this._el = document.getElementById(elementId);
    this._queue = [];
    this._running = false;
    this._currentTimeout = null;
  }

  showSequence(lines, intervalMs = 6000, onDone = null) {
    this._queue = [...lines];
    this._onDone = onDone;
    this._running = true;
    this._showNext(intervalMs);
  }

  _showNext(intervalMs) {
    if (!this._running || this._queue.length === 0) {
      if (this._onDone) this._onDone();
      return;
    }
    const line = this._queue.shift();
    this._fadeIn(line);
    this._currentTimeout = setTimeout(() => {
      this._fadeOut(() => this._showNext(intervalMs));
    }, intervalMs);
  }

  _fadeIn(text) {
    this._el.textContent = text;
    if (window.gsap) {
      gsap.to(this._el, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    } else {
      this._el.style.opacity = '1';
    }
  }

  _fadeOut(cb) {
    if (window.gsap) {
      gsap.to(this._el, { opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: cb });
    } else {
      this._el.style.opacity = '0';
      setTimeout(cb, 500);
    }
  }

  showOne(text) {
    this.stop();
    this._fadeIn(text);
  }

  stop() {
    this._running = false;
    if (this._currentTimeout) clearTimeout(this._currentTimeout);
    this._queue = [];
  }

  clear() {
    this.stop();
    this._fadeOut(() => {});
  }
}
```

- [ ] **Step 10.2: Crear `js/ui/Controls.js`**

```javascript
// js/ui/Controls.js
export class Controls {
  constructor() {
    this._btnPlay  = document.getElementById('btn-play');
    this._btnStep  = document.getElementById('btn-step');
    this._btnReset = document.getElementById('btn-reset');
    this._selSpeed = document.getElementById('sel-speed');
    this.playing   = false;
    this.speed     = 1;
    this.onPlay    = null;
    this.onPause   = null;
    this.onStep    = null;
    this.onReset   = null;
    this.onSpeed   = null;
    this._bindEvents();
  }

  _bindEvents() {
    this._btnPlay.addEventListener('click', () => this.togglePlay());
    this._btnStep.addEventListener('click', () => { if (this.onStep) this.onStep(); });
    this._btnReset.addEventListener('click', () => { if (this.onReset) this.onReset(); });
    this._selSpeed.addEventListener('change', () => {
      this.speed = parseFloat(this._selSpeed.value);
      if (this.onSpeed) this.onSpeed(this.speed);
    });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.code === 'KeyS')  { if (this.onStep) this.onStep(); }
      if (e.code === 'KeyR')  { if (this.onReset) this.onReset(); }
    });
  }

  togglePlay() {
    this.playing = !this.playing;
    this._btnPlay.textContent = this.playing ? '⏸ Pause' : '▶ Play';
    if (this.playing && this.onPlay) this.onPlay();
    if (!this.playing && this.onPause) this.onPause();
  }

  setPlaying(v) {
    this.playing = v;
    this._btnPlay.textContent = v ? '⏸ Pause' : '▶ Play';
  }
}
```

- [ ] **Step 10.3: Crear `js/ui/NavBar.js`**

```javascript
// js/ui/NavBar.js
export class NavBar {
  constructor() {
    this._btnPrev = document.getElementById('btn-prev');
    this._btnNext = document.getElementById('btn-next');
    this.onPrev   = null;
    this.onNext   = null;
    this._bindEvents();
  }

  _bindEvents() {
    this._btnPrev.addEventListener('click', () => { if (this.onPrev) this.onPrev(); });
    this._btnNext.addEventListener('click', () => { if (this.onNext) this.onNext(); });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'ArrowRight') { if (this.onNext) this.onNext(); }
      if (e.code === 'ArrowLeft')  { if (this.onPrev) this.onPrev(); }
    });
  }

  update(currentIndex, total) {
    this._btnPrev.disabled = currentIndex === 0;
    this._btnNext.disabled = currentIndex === total - 1;
  }
}
```

- [ ] **Step 10.4: Crear `js/ui/SidePanel.js`**

```javascript
// js/ui/SidePanel.js
export class SidePanel {
  constructor() {
    this._algoEl   = document.getElementById('tp-algo');
    this._statsEl  = document.getElementById('tp-stats');
    this._noteEl   = document.getElementById('tp-note');
    this._compEl   = document.getElementById('tp-comparison');
    this._slidersEl = document.getElementById('sliders-area');
    this._sliderDefs = [];
    this._sliderEls  = [];
  }

  setTitle(text) {
    this._algoEl.textContent = text;
  }

  setStats(rows) {
    this._statsEl.innerHTML = rows.map(([label, val]) =>
      `<div class="stat-row"><span>${label}</span><span class="mono-num">${val}</span></div>`
    ).join('');
  }

  setNote(text) {
    this._noteEl.textContent = text;
  }

  setComparison(rows) {
    if (!rows || rows.length === 0) { this._compEl.innerHTML = ''; return; }
    this._compEl.innerHTML = rows.map(([algo, val]) =>
      `<div class="row"><span class="algo-name">${algo}</span><span class="algo-val">${val}</span></div>`
    ).join('');
  }

  setSliders(defs) {
    this._sliderDefs = defs;
    this._sliderEls  = [];
    this._slidersEl.innerHTML = '';

    for (const def of defs) {
      if (def.type === 'range') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const lbl = document.createElement('label');
        lbl.innerHTML = `${def.label} <span id="sv-${def.id}">${Number(def.value).toFixed(def.decimals ?? 2)}</span>`;
        const input = document.createElement('input');
        input.type = 'range';
        input.min = def.min; input.max = def.max;
        input.step = def.step ?? 0.01;
        input.value = def.value;
        input.addEventListener('input', () => {
          const v = parseFloat(input.value);
          document.getElementById(`sv-${def.id}`).textContent = v.toFixed(def.decimals ?? 2);
          if (def.onChange) def.onChange(v);
        });
        grp.appendChild(lbl); grp.appendChild(input);
        this._slidersEl.appendChild(grp);
        this._sliderEls.push(input);
      } else if (def.type === 'toggle') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const row = document.createElement('div');
        row.className = 'toggle-group';
        for (const opt of def.options) {
          const btn = document.createElement('button');
          btn.className = 'btn-toggle' + (opt.value === def.value ? ' active' : '');
          btn.textContent = opt.label;
          btn.addEventListener('click', () => {
            row.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (def.onChange) def.onChange(opt.value);
          });
          row.appendChild(btn);
        }
        grp.appendChild(row);
        this._slidersEl.appendChild(grp);
      } else if (def.type === 'seed') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const lbl = document.createElement('label');
        lbl.textContent = 'Seed';
        const input = document.createElement('input');
        input.type = 'range'; input.min = 1; input.max = 9999; input.step = 1;
        input.value = def.value;
        const sp = document.createElement('span');
        sp.className = 'mono-num'; sp.style.fontSize = '14px'; sp.style.color = 'var(--text-muted)';
        sp.textContent = def.value;
        input.addEventListener('input', () => {
          const v = parseInt(input.value);
          sp.textContent = v;
          if (def.onChange) def.onChange(v);
        });
        grp.appendChild(lbl); grp.appendChild(input); grp.appendChild(sp);
        this._slidersEl.appendChild(grp);
      }
    }
  }

  clearSliders() {
    this._slidersEl.innerHTML = '';
    this._sliderEls = [];
  }

  addButton(label, onClick, id = null) {
    const btn = document.createElement('button');
    btn.className = 'ctrl-btn';
    btn.style.width = '100%';
    btn.style.marginTop = '0.5rem';
    btn.textContent = label;
    if (id) btn.id = id;
    btn.addEventListener('click', onClick);
    this._slidersEl.appendChild(btn);
    return btn;
  }
}
```

- [ ] **Step 10.5: Commit**

```bash
git add js/ui/
git commit -m "feat: UI — SubtitleOverlay, Controls, NavBar, SidePanel"
```

---

## Task 11: Escenas — Prólogo y Acto I

**Files:**
- Create: `js/narrative/scenes/PrologueScene.js`
- Create: `js/narrative/scenes/ActOneScene.js`

- [ ] **Step 11.1: Crear `js/narrative/scenes/PrologueScene.js`**

```javascript
// js/narrative/scenes/PrologueScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';

export class PrologueScene extends Scene {
  constructor(deps) {
    super('prologue');
    this.subtitle = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.heatmap   = deps.heatmap;
    this.p5ref     = deps.p5ref;
    this._pulse = 0;
    this.showOptimum = true;
  }

  enter(state) {
    this.showOptimum = true;
    this._pulse = 0;
    this.heatmap.setAlpha(102);

    this.sidePanel.setTitle('—');
    this.sidePanel.setStats([]);
    this.sidePanel.setNote('Un terreno. Un óptimo escondido en (0, 0).');
    this.sidePanel.setComparison([]);
    this.sidePanel.clearSliders();

    this.subtitle.showSequence(SUBTITLES.prologue, 4000, () => {
      this.showOptimum = false;
    });
  }

  update(dt, state) {
    this._pulse += dt * 0.003;
  }

  drawExtra(p5) {
    if (!this.showOptimum) return;
    const cx = p5.width / 2;
    const cy = p5.height / 2;
    const r  = 10 + Math.sin(this._pulse) * 4;
    p5.noStroke();
    p5.fill(255, 209, 102, 60 + Math.sin(this._pulse) * 40);
    p5.ellipse(cx, cy, r * 3, r * 3);
    p5.fill(255, 209, 102, 220);
    p5.ellipse(cx, cy, r, r);
  }

  exit(state) {
    this.subtitle.clear();
    this.heatmap.setAlpha(255);
  }
}
```

- [ ] **Step 11.2: Crear `js/narrative/scenes/ActOneScene.js`**

```javascript
// js/narrative/scenes/ActOneScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { ES } from '../../algorithms/ES.js';

export class ActOneScene extends Scene {
  constructor(deps) {
    super('act1');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this.overlay   = deps.overlay;
    this._algo     = null;
    this._seed     = 42;
    this._phase    = 'intro';
    this._subtitleIdx = 0;
    this._running  = false;
    this._genTarget = 180;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._phase = 'intro';
    this._running = false;
    this.controls.setPlaying(false);

    this._algo = new ES({ seed: this._seed, mu: 10, lambda: 30, sigma: 0.5 });

    this._updatePanel();

    this.subtitle.showSequence(SUBTITLES.act1.s11, 3500, () => {
      this._phase = 'running';
      this._running = true;
      this.controls.setPlaying(true);
      this.subtitle.showSequence(SUBTITLES.act1.s12, 8000);
    });

    this._setupSliders(state);

    this.controls.onPlay  = () => { this._running = true; };
    this.controls.onPause = () => { this._running = false; };
    this.controls.onStep  = () => { if (this._algo.generation < 500) { this._algo.step(); this._updatePanel(); } };
    this.controls.onReset = () => this._reset(state);
  }

  _setupSliders(state) {
    this.sidePanel.setSliders([
      { type: 'range', id: 'sigma', label: 'σ (mutación)', min: 0.01, max: 2.0, step: 0.01, value: 0.5, decimals: 2,
        onChange: v => { this._algo.sigma = v; } },
      { type: 'range', id: 'mu', label: 'μ (padres)', min: 5, max: 20, step: 1, value: 10, decimals: 0,
        onChange: v => { this._algo.mu = Math.round(v); this._updatePanel(); } },
      { type: 'range', id: 'lambda', label: 'λ (hijos)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => { this._algo.lambda = Math.round(v); this._updatePanel(); } },
      { type: 'toggle', id: 'mode', label: 'Modo', value: false,
        options: [{ label: '(μ,λ)', value: false }, { label: '(μ+λ)', value: true }],
        onChange: v => { this._algo.plusMode = v; } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._reset(state); } },
    ]);
  }

  _reset(state) {
    this._algo.reset(this._seed);
    this._running = false;
    this.controls.setPlaying(false);
    this._updatePanel();
  }

  _updatePanel() {
    const a = this._algo;
    this.sidePanel.setTitle('Evolution Strategies (μ,λ)-ES');
    this.sidePanel.setStats([
      ['Generación', a.generation],
      ['Mejor fitness', a.bestFitness.toFixed(4)],
      ['μ', a.mu], ['λ', a.lambda], ['σ', a.sigma.toFixed(3)],
    ]);
    this.sidePanel.setNote(SUBTITLES.act1.note);
    if (a.generation >= this._genTarget) {
      this.bestResults.es = { gen: a.generation, best: a.bestFitness };
      this.sidePanel.setComparison([
        ['ES (este jardín)', `${a.generation} gen · ${a.bestFitness.toFixed(3)}`],
      ]);
    }
  }

  update(dt, state) {
    if (!this._running) return;
    if (this._algo.generation >= 500) { this._running = false; return; }
    const stepsPerFrame = Math.max(1, Math.round(state.speed ?? 1));
    for (let i = 0; i < stepsPerFrame; i++) {
      if (this._algo.generation < 500) this._algo.step();
    }
    this._updatePanel();

    if (this._algo.generation >= this._genTarget) {
      this._running = false;
      this.controls.setPlaying(false);
      this.subtitle.showSequence(SUBTITLES.act1.s13, 4500);
      this.bestResults.es = { gen: this._algo.generation, best: this._algo.bestFitness };
    }
  }

  getPopulation() { return this._algo?.population; }
  getAlgo() { return this._algo; }

  exit(state) {
    this._running = false;
    this.subtitle.clear();
    state.esResult = this.bestResults.es;
  }
}
```

- [ ] **Step 11.3: Commit**

```bash
git add js/narrative/scenes/PrologueScene.js js/narrative/scenes/ActOneScene.js
git commit -m "feat: PrologueScene y ActOneScene"
```

---

## Task 12: Escenas — Acto II y Acto III

**Files:**
- Create: `js/narrative/scenes/ActTwoScene.js`
- Create: `js/narrative/scenes/ActThreeScene.js`

- [ ] **Step 12.1: Crear `js/narrative/scenes/ActTwoScene.js`**

```javascript
// js/narrative/scenes/ActTwoScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { CMAES } from '../../algorithms/CMAES.js';

export class ActTwoScene extends Scene {
  constructor(deps) {
    super('act2');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this._algo     = null;
    this._seed     = 42;
    this._running  = false;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._running = false;
    this.controls.setPlaying(false);
    this._algo = new CMAES({ seed: this._seed, lambda: 30, sigma: 0.5 });

    this._updatePanel(state);

    this.subtitle.showSequence(SUBTITLES.act2.s21, 4000, () => {
      this._running = true;
      this.controls.setPlaying(true);
      this.subtitle.showSequence(SUBTITLES.act2.s22, 8000);
    });

    this._setupSliders(state);

    this.controls.onPlay  = () => { this._running = true; };
    this.controls.onPause = () => { this._running = false; };
    this.controls.onStep  = () => { this._algo.step(); this._updatePanel(state); };
    this.controls.onReset = () => {
      this._algo.reset(this._seed);
      this._running = false;
      this.controls.setPlaying(false);
      this._updatePanel(state);
    };
  }

  _setupSliders(state) {
    this.sidePanel.setSliders([
      { type: 'range', id: 'lambda', label: 'λ (población)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => { this._algo.lambda = Math.round(v); this._algo.mu = Math.floor(v / 2); } },
      { type: 'toggle', id: 'ellipse', label: 'Elipse', value: true,
        options: [{ label: 'Mostrar', value: true }, { label: 'Ocultar', value: false }],
        onChange: v => { this._algo.showEllipse = v; } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._algo.reset(v); this._updatePanel(state); } },
    ]);
  }

  _updatePanel(state) {
    const a = this._algo;
    this.sidePanel.setTitle('CMA-ES (rank-1 update)');
    this.sidePanel.setStats([
      ['Generación', a.generation],
      ['Mejor fitness', a.bestFitness.toFixed(6)],
      ['λ', a.lambda], ['σ', a.sigma.toFixed(4)],
    ]);
    this.sidePanel.setNote('');
    const rows = [];
    if (state?.esResult) rows.push(['Jardinero ingenuo (ES)', `${state.esResult.gen} gen`]);
    if (a.generation > 0) rows.push(['Jardinero que observa (CMA-ES)', `${a.generation} gen`]);
    this.sidePanel.setComparison(rows);
  }

  update(dt, state) {
    if (!this._running) return;
    if (this._algo.generation >= 500) { this._running = false; return; }
    const stepsPerFrame = Math.max(1, Math.round(state.speed ?? 1));
    for (let i = 0; i < stepsPerFrame; i++) {
      if (this._algo.generation < 500) this._algo.step();
    }
    this._updatePanel(state);

    if (this._algo.bestFitness < 0.01 || this._algo.generation >= 500) {
      this._running = false;
      this.controls.setPlaying(false);
      this.bestResults.cmaes = { gen: this._algo.generation, best: this._algo.bestFitness };
      this.subtitle.showSequence(SUBTITLES.act2.s23, 4000);
    }
  }

  getPopulation() { return this._algo?.population; }
  getAlgo() { return this._algo; }

  exit(state) {
    this._running = false;
    this.subtitle.clear();
    state.cmaesResult = this.bestResults.cmaes;
  }
}
```

- [ ] **Step 12.2: Crear `js/narrative/scenes/ActThreeScene.js`**

```javascript
// js/narrative/scenes/ActThreeScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { DE } from '../../algorithms/DE.js';

export class ActThreeScene extends Scene {
  constructor(deps) {
    super('act3');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this._algo     = null;
    this._seed     = 42;
    this._running  = false;
    this._highlightIdx = 0;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._running = false;
    this.controls.setPlaying(false);
    this._algo = new DE({ seed: this._seed, F: 0.5, CR: 0.9, NP: 30 });

    this._updatePanel(state);

    this.subtitle.showSequence(SUBTITLES.act3.s31, 4000, () => {
      this.subtitle.showSequence(SUBTITLES.act3.s32, 5000, () => {
        this._running = true;
        this.controls.setPlaying(true);
        this.subtitle.showSequence(SUBTITLES.act3.s33, 7000);
      });
    });

    this._setupSliders(state);

    this.controls.onPlay  = () => { this._running = true; };
    this.controls.onPause = () => { this._running = false; };
    this.controls.onStep  = () => {
      this._algo.step();
      this._highlightIdx = 0;
      this._updatePanel(state);
    };
    this.controls.onReset = () => {
      this._algo.reset(this._seed);
      this._running = false;
      this.controls.setPlaying(false);
      this._updatePanel(state);
    };
  }

  _setupSliders(state) {
    this.sidePanel.setSliders([
      { type: 'range', id: 'F', label: 'F (escala diferencial)', min: 0.1, max: 2.0, step: 0.05, value: 0.5, decimals: 2,
        onChange: v => { this._algo.F = v; } },
      { type: 'range', id: 'CR', label: 'CR (crossover)', min: 0.1, max: 1.0, step: 0.05, value: 0.9, decimals: 2,
        onChange: v => { this._algo.CR = v; } },
      { type: 'range', id: 'NP', label: 'NP (población)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => { this._algo.NP = Math.round(v); } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._algo.reset(v); this._updatePanel(state); } },
    ]);
  }

  _updatePanel(state) {
    const a = this._algo;
    this.sidePanel.setTitle('Differential Evolution (DE/rand/1/bin)');
    this.sidePanel.setStats([
      ['Generación', a.generation],
      ['Mejor fitness', a.bestFitness.toFixed(4)],
      ['F', a.F.toFixed(2)], ['CR', a.CR.toFixed(2)], ['NP', a.NP],
    ]);
    this.sidePanel.setNote('');
    const rows = [];
    if (state?.esResult)    rows.push(['Jardinero ingenuo (ES)', `${state.esResult.gen} gen`]);
    if (state?.cmaesResult) rows.push(['Jardinero que observa (CMA-ES)', `${state.cmaesResult.gen} gen`]);
    if (a.generation > 0)   rows.push(['Jardinero de las hermanas (DE)', `${a.generation} gen`]);
    this.sidePanel.setComparison(rows);
  }

  update(dt, state) {
    if (!this._running) return;
    if (this._algo.generation >= 500) { this._running = false; return; }
    const stepsPerFrame = Math.max(1, Math.round(state.speed ?? 1));
    for (let i = 0; i < stepsPerFrame; i++) {
      if (this._algo.generation < 500) this._algo.step();
    }
    this._highlightIdx = Math.floor(Math.random() * this._algo.NP);
    this._updatePanel(state);

    if (this._algo.bestFitness < 0.05 || this._algo.generation >= 500) {
      this._running = false;
      this.controls.setPlaying(false);
      this.bestResults.de = { gen: this._algo.generation, best: this._algo.bestFitness };
    }
  }

  getPopulation() { return this._algo?.population; }
  getAlgo() { return this._algo; }
  getHighlightIdx() { return this._highlightIdx; }

  exit(state) {
    this._running = false;
    this.subtitle.clear();
    state.deResult = this.bestResults.de;
  }
}
```

- [ ] **Step 12.3: Commit**

```bash
git add js/narrative/scenes/ActTwoScene.js js/narrative/scenes/ActThreeScene.js
git commit -m "feat: ActTwoScene (CMA-ES) y ActThreeScene (DE)"
```

---

## Task 13: Epílogo

**Files:**
- Create: `js/narrative/scenes/EpilogueScene.js`

- [ ] **Step 13.1: Crear `js/narrative/scenes/EpilogueScene.js`**

```javascript
// js/narrative/scenes/EpilogueScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { Individual } from '../../core/Individual.js';
import { Population } from '../../core/Population.js';
import { mulberry32 } from '../../core/rng.js';
import { lerp, clamp } from '../../core/math-utils.js';

export class EpilogueScene extends Scene {
  constructor(deps) {
    super('epilogue');
    this.subtitle    = deps.subtitle;
    this.sidePanel   = deps.sidePanel;
    this.controls    = deps.controls;
    this.sceneManager = deps.sceneManager;
    this.bestResults  = deps.bestResults;
    this._points = [];
    this._pulse = 0;
  }

  _buildConvergingPoints(seed) {
    const rng = mulberry32(seed);
    const pts = [];
    for (let i = 0; i < 30; i++) {
      const sx = (rng() * 2 - 1) * 5.12;
      const sy = (rng() * 2 - 1) * 5.12;
      pts.push({ sx, sy, x: sx, y: sy, t: 0 });
    }
    return pts;
  }

  enter(state) {
    this._points = this._buildConvergingPoints(state.seed ?? 42);
    this._pulse = 0;
    this.controls.setPlaying(false);
    this.controls.onPlay = null; this.controls.onPause = null;
    this.controls.onStep = null; this.controls.onReset = null;

    this.sidePanel.setTitle('Tres caminos, una misma flor');
    const rows = [];
    if (state.esResult)    rows.push(['Jardinero ingenuo (ES)', `${state.esResult.gen} gen · ${state.esResult.best.toFixed(3)}`]);
    if (state.cmaesResult) rows.push(['Jardinero que observa (CMA-ES)', `${state.cmaesResult.gen} gen · ${state.cmaesResult.best.toFixed(6)}`]);
    if (state.deResult)    rows.push(['Jardinero de las hermanas (DE)', `${state.deResult.gen} gen · ${state.deResult.best.toFixed(4)}`]);
    this.sidePanel.setStats([]);
    this.sidePanel.setNote('');
    this.sidePanel.setComparison(rows);

    this.sidePanel.clearSliders();
    this.sidePanel.addButton('↺ Volver al prólogo', () => this.sceneManager.goto(0));
    this.sidePanel.addButton('🌱 Sembrar de nuevo', () => {
      state.seed = Math.floor(Math.random() * 9999) + 1;
      this._points = this._buildConvergingPoints(state.seed);
    });

    this.subtitle.showSequence(SUBTITLES.epilogue, 4000);
  }

  update(dt, state) {
    this._pulse += dt * 0.003;
    for (const pt of this._points) {
      pt.t = clamp(pt.t + dt * 0.0008, 0, 1);
      pt.x = lerp(pt.sx, 0, pt.t);
      pt.y = lerp(pt.sy, 0, pt.t);
    }
  }

  getPopulation() {
    const inds = this._points.map(pt => new Individual(pt.x, pt.y));
    return new Population(inds);
  }

  getPulse() { return this._pulse; }

  exit(state) {
    this.subtitle.clear();
  }
}
```

- [ ] **Step 13.2: Commit**

```bash
git add js/narrative/scenes/EpilogueScene.js
git commit -m "feat: EpilogueScene con convergencia y botones reset"
```

---

## Task 14: main.js — integración completa

**Files:**
- Modify: `js/main.js`

- [ ] **Step 14.1: Escribir `js/main.js` completo**

```javascript
// js/main.js
import { HeatmapRenderer }  from './render/HeatmapRenderer.js';
import { PointsRenderer }   from './render/PointsRenderer.js';
import { OverlayRenderer }  from './render/OverlayRenderer.js';
import { SceneManager }     from './narrative/SceneManager.js';
import { SubtitleOverlay }  from './ui/SubtitleOverlay.js';
import { SidePanel }        from './ui/SidePanel.js';
import { Controls }         from './ui/Controls.js';
import { NavBar }           from './ui/NavBar.js';
import { PrologueScene }    from './narrative/scenes/PrologueScene.js';
import { ActOneScene }      from './narrative/scenes/ActOneScene.js';
import { ActTwoScene }      from './narrative/scenes/ActTwoScene.js';
import { ActThreeScene }    from './narrative/scenes/ActThreeScene.js';
import { EpilogueScene }    from './narrative/scenes/EpilogueScene.js';

const subtitle   = new SubtitleOverlay('subtitle-text');
const sidePanel  = new SidePanel();
const controls   = new Controls();
const navbar     = new NavBar();
const heatmap    = new HeatmapRenderer();
const points     = new PointsRenderer();
const overlay    = new OverlayRenderer();
const bestResults = {};

const sharedDeps = { subtitle, sidePanel, controls, overlay, heatmap, bestResults };

const sceneManager = new SceneManager();
const epilogue = new EpilogueScene({ ...sharedDeps, sceneManager });
sharedDeps.sceneManager = sceneManager;

sceneManager.scenes = [
  new PrologueScene(sharedDeps),
  new ActOneScene(sharedDeps),
  new ActTwoScene(sharedDeps),
  new ActThreeScene(sharedDeps),
  epilogue,
];

const state = { seed: 42, speed: 1 };
sceneManager.setState(state);

navbar.onNext = () => {
  if (sceneManager.next()) navbar.update(sceneManager.currentIndex, sceneManager.total);
};
navbar.onPrev = () => {
  if (sceneManager.prev()) navbar.update(sceneManager.currentIndex, sceneManager.total);
};
controls.onSpeed = v => { state.speed = v; };

let lastTime = 0;

new p5(function(p) {
  p.setup = function() {
    const container = document.getElementById('canvas-container');
    p.createCanvas(container.offsetWidth, container.offsetHeight).parent('canvas-container');
    p.frameRate(30);
    heatmap.precompute(p, p.width, p.height);
    sceneManager.goto(0);
    navbar.update(0, sceneManager.total);

    window.addEventListener('resize', () => {
      const c = document.getElementById('canvas-container');
      p.resizeCanvas(c.offsetWidth, c.offsetHeight);
      heatmap.precompute(p, p.width, p.height);
    });
  };

  p.draw = function() {
    const now = p.millis();
    const dt = now - lastTime;
    lastTime = now;

    sceneManager.update(dt);

    p.background(7, 16, 10);
    heatmap.draw(p);

    const scene = sceneManager.current;

    if (scene?.name === 'prologue') {
      scene.drawExtra?.(p);
    } else {
      const pop = scene?.getPopulation?.();
      const algo = scene?.getAlgo?.();

      let deHighlight = null;
      if (scene?.name === 'act3') {
        const idx = scene.getHighlightIdx?.();
        if (algo?.stepInfo?.[idx]) deHighlight = algo.stepInfo[idx];
      }

      points.draw(p, pop, { deHighlight });

      if (scene?.name === 'act2') {
        overlay.drawEllipse(p, algo);
      }
      if (scene?.name === 'act3' && deHighlight) {
        overlay.drawArrows(p, algo?.stepInfo, scene.getHighlightIdx?.());
      }
      if (scene?.name === 'epilogue') {
        const pulse = scene.getPulse?.() ?? 0;
        const cx = p.width / 2, cy = p.height / 2;
        const r = 12 + Math.sin(pulse) * 4;
        p.noStroke();
        p.fill(255, 209, 102, 50 + Math.sin(pulse) * 30);
        p.ellipse(cx, cy, r * 3.5, r * 3.5);
        p.fill(255, 209, 102, 240);
        p.ellipse(cx, cy, r, r);
      }
    }
  };

  p.mouseMoved = function() {
    const scene = sceneManager.current;
    if (scene?.name !== 'act1') return;
    const algo = scene?.getAlgo?.();
    if (!algo?.population) return;
    const pop = algo.population.individuals;
    let closest = -1, minD = 400;
    for (let i = 0; i < pop.length; i++) {
      const { cx, cy } = { cx: p.width * (pop[i].x + 5.12) / 10.24, cy: p.height * (1 - (pop[i].y + 5.12) / 10.24) };
      const d = Math.sqrt((p.mouseX - cx) ** 2 + (p.mouseY - cy) ** 2);
      if (d < minD) { minD = d; closest = i; }
    }
    if (closest >= 0) {
      points.drawMutationCircle(p, pop[closest], algo.sigma);
    }
  };
});
```

- [ ] **Step 14.2: Verificar experiencia completa**

Abrir `index.html` con doble-click:
1. Se ve prólogo: fondo oscuro, punto dorado pulsante en centro, texto del Narrador con fade.
2. Presionar `Siguiente ▶`: aparece heatmap iluminado, 30 puntos dispersos, panel técnico con ES, sliders activos.
3. Play corre la animación, los puntos convergen gradualmente.
4. `Siguiente ▶` lleva al Acto II: mismos puntos iniciales, elipse verde menta aparece y se deforma.
5. `Siguiente ▶` lleva al Acto III: tres puntos destacados con colores, flechas aparecen durante la animación.
6. `Siguiente ▶` lleva al Epílogo: puntos convergen al centro, tabla comparativa, botones de reset.
7. Teclado: `Space`, `→`, `←`, `S`, `R` funcionan.

- [ ] **Step 14.3: Commit**

```bash
git add js/main.js
git commit -m "feat: main.js — integración completa del loop p5 con todas las escenas"
```

---

## Task 15: Pulido — responsive, tipografía, edge cases

**Files:**
- Modify: `css/layout.css` (ajustes responsive)
- Modify: `css/components.css` (ajustes visuales menores)

- [ ] **Step 15.1: Verificar responsive a < 900px**

Abrir DevTools → Toggle device toolbar → establecer ancho 375px.
Esperado: texto arriba, canvas abajo, todo legible, sin overflow horizontal.

Si hay problemas: ajustar en `css/layout.css`:
```css
@media (max-width: 900px) {
  #app { flex-direction: column; overflow-y: auto; }
  #left-panel { width: 100%; height: auto; min-height: 280px; max-height: 45vh; overflow-y: auto; }
  #right-panel { min-height: 300px; }
  html, body { overflow: auto; height: auto; }
}
```

- [ ] **Step 15.2: Verificar legibilidad a 1280×720 (Zoom)**

Establecer ventana a 1280×720. Verificar:
- Narrador: ≥ 18px
- Panel técnico: ≥ 16px
- Botones: ≥ 15px
- Elipse CMA-ES visible
- Heatmap distinguible (no todo negro)

- [ ] **Step 15.3: Verificar determinismo con seed=42**

En consola del navegador:
```javascript
import { ES } from './js/algorithms/ES.js';
import { CMAES } from './js/algorithms/CMAES.js';
import { DE } from './js/algorithms/DE.js';

const es1 = new ES({ seed: 42 });
const es2 = new ES({ seed: 42 });
for (let i = 0; i < 50; i++) { es1.step(); es2.step(); }
console.assert(es1.bestFitness === es2.bestFitness, 'ES determinista');

const c1 = new CMAES({ seed: 42 });
const c2 = new CMAES({ seed: 42 });
for (let i = 0; i < 50; i++) { c1.step(); c2.step(); }
console.assert(c1.bestFitness === c2.bestFitness, 'CMA-ES determinista');

console.log('Determinismo OK');
```

- [ ] **Step 15.4: Verificar sin internet (modo avión)**

Desconectar red. Abrir `index.html`. Los fallbacks de `vendor/` deben cargar.
Si falla: revisar que las etiquetas `onerror` del HTML apunten correctamente a `vendor/`.

- [ ] **Step 15.5: Commit final**

```bash
git add -A
git commit -m "feat: experiencia completa — El Jardinero y la Flor Perfecta v2"
```

---

## QA Final — checklist

- [ ] `index.html` abre con doble-click sin servidor
- [ ] Modo avión: funciona con `vendor/`
- [ ] Seed=42 produce resultado idéntico en dos ejecuciones
- [ ] Zoom 1280×720: legible, elipse visible, heatmap distinguible
- [ ] Transiciones entre actos: fade suave, sin flash
- [ ] Teclado funciona en los 5 actos: Space, →, ←, S, R
- [ ] Ningún archivo JS supera 250 líneas
- [ ] Ningún archivo CSS supera 200 líneas
- [ ] Sin eval(), new Function(), ni innerHTML con datos dinámicos
- [ ] Tipografía mínima 16px UI, 18px subtítulos
- [ ] FPS capado a 30
- [ ] Responsive < 900px: apila sin romperse

---

## Self-Review

**Spec coverage:**
- ✅ Prólogo con punto dorado pulsante y heatmap oscurecido → Task 11
- ✅ Acto I ES: σ slider, círculo hover, narrativa rotante → Task 11
- ✅ Acto II CMA-ES: elipse rank-1, toggle show/hide → Tasks 5, 12
- ✅ Acto III DE: flechas efímeras a, b, c → Tasks 6, 12, 8
- ✅ Epílogo: convergencia, comparación, botones reset → Task 13
- ✅ Controles Play/Pause/Step/Reset/velocidad → Task 10
- ✅ Teclado Space/→/←/S/R → Task 10
- ✅ Heatmap precomputado → Task 7
- ✅ RNG Mulberry32 determinista → Task 2
- ✅ Responsive <900px → Task 15
- ✅ Vendor fallback → Task 1
- ✅ CSP en head → Task 1
- ✅ Paleta y tipografía → Tasks 1

**Tipos consistentes a lo largo del plan:**
- `Individual(x, y)` → mismo constructor en todos los algoritmos ✅
- `population.best()`, `population.individuals` → consistente en renderers y escenas ✅
- `worldToCanvas(x, y, w, h)` → usado en PointsRenderer y OverlayRenderer ✅
- `getPopulation()`, `getAlgo()` → interfaz uniforme en todas las escenas ✅
- `state.seed`, `state.speed`, `state.esResult`, `state.cmaesResult`, `state.deResult` → pasado por el SceneManager ✅
