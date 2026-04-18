// js/narrative/scenes/PrologueScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { drawParamIllustrations, isPauseHit } from '../../render/PrologueIllustrations.js';

const PARAM_DIAGRAM = `
<article class="param-card algo-es">
  <header class="param-card-head">
    <h4 class="param-card-title">Evolution Strategies</h4>
    <span class="param-card-tag">Acto I · ES</span>
  </header>
  <div class="param-list">
    <div class="param-item">
      <span class="param-glyph">σ</span>
      <div class="param-body">
        <span class="param-name">Sigma · radio</span>
        <span class="param-def">Distancia del pozo padre al pozo hijo. Grande explora; pequeño refina.</span>
        <span class="param-example">σ = 0.50 (default)</span>
      </div>
    </div>
    <div class="param-item">
      <span class="param-glyph">μ</span>
      <div class="param-body">
        <span class="param-name">Mu · padres</span>
        <span class="param-def">Cuántos de los mejores pozos pasan a la siguiente campaña.</span>
        <span class="param-example">μ = 10 pozos</span>
      </div>
    </div>
    <div class="param-item">
      <span class="param-glyph">λ</span>
      <div class="param-body">
        <span class="param-name">Lambda · descendencia</span>
        <span class="param-def">Pozos nuevos perforados alrededor de los padres cada campaña.</span>
        <span class="param-example">λ = 30 pozos / campaña</span>
      </div>
    </div>
  </div>
</article>

<article class="param-card algo-cmaes">
  <header class="param-card-head">
    <h4 class="param-card-title">Covariance Matrix Adaptation</h4>
    <span class="param-card-tag">Acto II · CMA-ES</span>
  </header>
  <div class="param-list">
    <div class="param-item">
      <span class="param-glyph">λ</span>
      <div class="param-body">
        <span class="param-name">Lambda · pozos</span>
        <span class="param-def">Cuántos pozos se perforan por campaña.</span>
        <span class="param-example">λ = 30</span>
      </div>
    </div>
    <div class="param-item">
      <span class="param-glyph">C</span>
      <div class="param-body">
        <span class="param-name">Covarianza · forma</span>
        <span class="param-def">Matriz que aprende la geometría del subsuelo. La elipse verde la representa visualmente.</span>
        <span class="param-example">visible en el canvas</span>
      </div>
    </div>
  </div>
</article>

<article class="param-card algo-de">
  <header class="param-card-head">
    <h4 class="param-card-title">Differential Evolution</h4>
    <span class="param-card-tag">Acto III · DE</span>
  </header>
  <div class="param-list">
    <div class="param-item">
      <span class="param-glyph">NP</span>
      <div class="param-body">
        <span class="param-name">N · portafolio</span>
        <span class="param-def">Cuántos pozos activos se mantienen al mismo tiempo.</span>
        <span class="param-example">NP = 30</span>
      </div>
    </div>
    <div class="param-item">
      <span class="param-glyph">F</span>
      <div class="param-body">
        <span class="param-name">F · escala diferencial</span>
        <span class="param-def">Cuánto se amplifica la diferencia entre dos pozos para proponer uno nuevo.</span>
        <span class="param-example">F = 0.50</span>
      </div>
    </div>
    <div class="param-item">
      <span class="param-glyph">CR</span>
      <div class="param-body">
        <span class="param-name">CR · cruce</span>
        <span class="param-def">Probabilidad de mezclar coordenadas del candidato con el pozo original.</span>
        <span class="param-example">CR = 0.90</span>
      </div>
    </div>
  </div>
</article>
`;

export class PrologueScene extends Scene {
  constructor(deps) {
    super('prologue');
    this.subtitle     = deps.subtitle;
    this.sidePanel    = deps.sidePanel;
    this.heatmap      = deps.heatmap;
    this.controls     = deps.controls;
    this._pulse = 0;
    this._paramElapsed = 0;
    this._paramPaused  = false;
  }

  enter(state) {
    this._pulse = 0;
    this._paramElapsed = 0;
    this._paramPaused  = false;
    this.heatmap.setAlpha(102);
    this.controls.setPlaying(false);
    this.controls.onPlay  = null;
    this.controls.onPause = null;
    this.controls.onReset = null;

    this.sidePanel.setHeader('', 'Exploración de Yacimientos');
    this.sidePanel.setTitle('—');
    this.sidePanel.setStats([]);
    this.sidePanel.setNote('Sección sísmica simplificada. El yacimiento óptimo está en (0, 0) — puede ser marino o terrestre.');
    this.sidePanel.setComparison([]);
    this.sidePanel.clearSliders();

    this._setupSlides([
      { lines: SUBTITLES.prologue },
      {
        lines: ['Los algoritmos usan parámetros con letras griegas. Aquí está lo que significan.'],
        onEnter: () => this.sidePanel.setDiagram(PARAM_DIAGRAM),
        onExit:  () => this.sidePanel.clearDiagram(),
      },
    ]);
    this._gotoSlide(0);
  }

  update(dt, state) {
    this._pulse += dt * 0.003;
    if (this._slideIdx === 1) {
      if (!this._paramPaused) this._paramElapsed += dt;
    } else {
      this._paramElapsed = 0;
      this._paramPaused = false;
    }
  }

  handleCanvasClick(x, y, p5) {
    if (this._slideIdx !== 1) return false;
    if (isPauseHit(p5, x, y)) {
      this._paramPaused = !this._paramPaused;
      return true;
    }
    return false;
  }

  drawExtra(p5) {
    if (this._slideIdx === 1) {
      drawParamIllustrations(p5, this._paramElapsed, this._paramPaused);
      return;
    }
    const cx = p5.width / 2;
    const cy = p5.height / 2;
    const r  = 10 + Math.sin(this._pulse) * 4;
    p5.noStroke();
    p5.fill(255, 209, 102, 60 + Math.sin(this._pulse) * 40);
    p5.ellipse(cx, cy, r * 3.5, r * 3.5);
    p5.fill(255, 209, 102, 220);
    p5.ellipse(cx, cy, r, r);
  }

  exit(state) {
    this.sidePanel.clearDiagram();
    this.heatmap.setAlpha(255);
  }
}
