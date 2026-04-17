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
