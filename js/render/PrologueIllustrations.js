// js/render/PrologueIllustrations.js
// Dispatcher animado de los 8 parámetros del Prólogo (slide 2).
import { VISUALS } from './ParamVisuals.js';

const COL_ES   = [245, 166,  35];
const COL_CMA  = [ 61, 214, 160];
const COL_DE   = [232,  48,  96];
const COL_TXT  = [192, 168, 130];

const STEP_MS = 3500;

const PARAMS = [
  { glyph:'σ',  algo:'ES',     name:'Sigma · radio',         color:COL_ES,
    desc:'Distancia del pozo padre al pozo hijo. σ grande explora; σ pequeño refina.',
    draw:VISUALS.sigma },
  { glyph:'μ',  algo:'ES',     name:'Mu · padres',           color:COL_ES,
    desc:'Cuántos de los mejores pozos sobreviven y pasan a la siguiente campaña.',
    draw:VISUALS.mu },
  { glyph:'λ',  algo:'ES',     name:'Lambda · descendencia', color:COL_ES,
    desc:'Pozos nuevos perforados alrededor de cada padre por campaña.',
    draw:VISUALS.lambdaES },
  { glyph:'λ',  algo:'CMA-ES', name:'Lambda · pozos',        color:COL_CMA,
    desc:'Tamaño de la muestra que CMA-ES perfora en cada campaña.',
    draw:VISUALS.lambdaCMA },
  { glyph:'C',  algo:'CMA-ES', name:'Covarianza · forma',    color:COL_CMA,
    desc:'Matriz que aprende la geometría del subsuelo. La elipse es su huella visual.',
    draw:VISUALS.C },
  { glyph:'NP', algo:'DE',     name:'N · portafolio',        color:COL_DE,
    desc:'Tamaño del portafolio de pozos activos que evolucionan en paralelo.',
    draw:VISUALS.NP },
  { glyph:'F',  algo:'DE',     name:'F · diferencial',       color:COL_DE,
    desc:'Cuánto se amplifica la diferencia entre dos pozos para proponer uno nuevo.',
    draw:VISUALS.F },
  { glyph:'CR', algo:'DE',     name:'CR · cruce',            color:COL_DE,
    desc:'Probabilidad de tomar cada coordenada del candidato en lugar del original.',
    draw:VISUALS.CR },
];

export function drawParamIllustrations(p5, elapsedMs, paused = false) {
  p5.noStroke();
  p5.fill(10, 9, 6, 220);
  p5.rect(0, 0, p5.width, p5.height);

  const idx = Math.floor(elapsedMs / STEP_MS) % PARAMS.length;
  const t   = (elapsedMs % STEP_MS) / STEP_MS;
  const param = PARAMS[idx];

  let alpha = 1;
  if (t < 0.12) alpha = t / 0.12;
  else if (t > 0.88) alpha = (1 - t) / 0.12;

  drawHeader(p5, param, alpha);
  drawViz(p5, param, t, alpha);
  drawDesc(p5, param, alpha);
  drawProgress(p5, idx);
  drawPauseButton(p5, paused);
}

function drawHeader(p5, param, alpha) {
  const cx = p5.width / 2;
  const yGlyph = p5.height * 0.16;

  p5.push();
  p5.drawingContext.globalAlpha = alpha;

  p5.noStroke();
  p5.fill(param.color[0], param.color[1], param.color[2], 240);
  p5.textFont('Fraunces');
  p5.textStyle(p5.ITALIC);
  p5.textSize(Math.min(110, p5.width * 0.13));
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.text(param.glyph, cx, yGlyph);

  p5.fill(param.color[0], param.color[1], param.color[2], 210);
  p5.textFont('Syne');
  p5.textStyle(p5.NORMAL);
  p5.textSize(11);
  p5.text(param.algo.toUpperCase(), cx, yGlyph + 70);

  p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 235);
  p5.textSize(14);
  p5.text(param.name, cx, yGlyph + 92);

  p5.pop();
}

function drawViz(p5, param, t, alpha) {
  const cx = p5.width / 2;
  const cy = p5.height * 0.56;
  const size = Math.min(p5.height * 0.36, p5.width * 0.5);

  p5.push();
  p5.drawingContext.globalAlpha = alpha;
  param.draw(p5, cx, cy, size, param.color, t);
  p5.pop();
}

function drawDesc(p5, param, alpha) {
  const w = Math.min(560, p5.width * 0.78);
  const x = (p5.width - w) / 2;
  const y = p5.height - 96;

  p5.push();
  p5.drawingContext.globalAlpha = alpha;
  p5.noStroke();
  p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 215);
  p5.textFont('Fraunces');
  p5.textStyle(p5.ITALIC);
  p5.textSize(15);
  p5.textAlign(p5.CENTER, p5.TOP);
  p5.text(param.desc, x, y, w, 60);
  p5.pop();
}

function drawProgress(p5, idx) {
  const total = PARAMS.length;
  const w = 18, gap = 6;
  const totalW = total * w + (total - 1) * gap;
  const startX = (p5.width - totalW) / 2;
  const y = p5.height - 28;

  for (let i = 0; i < total; i++) {
    p5.noStroke();
    const active = i === idx;
    p5.fill(active ? PARAMS[i].color[0] : COL_TXT[0],
            active ? PARAMS[i].color[1] : COL_TXT[1],
            active ? PARAMS[i].color[2] : COL_TXT[2],
            active ? 235 : 70);
    p5.rect(startX + i * (w + gap), y, w, active ? 4 : 2, 2);
  }
}

function drawPauseButton(p5, paused) {
  const { x, y, r } = getPauseHitbox(p5);
  // Fondo
  p5.noStroke();
  p5.fill(38, 30, 20, 220);
  p5.ellipse(x, y, r * 2, r * 2);
  p5.stroke(192, 168, 130, 180);
  p5.strokeWeight(1);
  p5.noFill();
  p5.ellipse(x, y, r * 2, r * 2);

  p5.noStroke();
  p5.fill(245, 166, 35, 240);
  if (paused) {
    // Triángulo play
    p5.triangle(x - 5, y - 7, x - 5, y + 7, x + 7, y);
  } else {
    // Dos barras de pausa
    p5.rect(x - 6, y - 7, 4, 14, 1);
    p5.rect(x + 2, y - 7, 4, 14, 1);
  }
}

export function getPauseHitbox(p5) {
  return { x: p5.width - 36, y: 36, r: 20 };
}

export function isPauseHit(p5, mx, my) {
  const h = getPauseHitbox(p5);
  return Math.hypot(mx - h.x, my - h.y) <= h.r;
}
