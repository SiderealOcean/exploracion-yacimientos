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
    this.controls.onReset = null;

    this.sidePanel.setHeader('Epílogo', 'Tres estrategias, un yacimiento');
    this.sidePanel.setTitle('Tres estrategias, un yacimiento');
    const rows = [];
    if (state.esResult)    rows.push(['ES', `${state.esResult.gen} camp. · ${state.esResult.best.toFixed(3)}`]);
    if (state.cmaesResult) rows.push(['CMA-ES', `${state.cmaesResult.gen} camp. · ${state.cmaesResult.best.toFixed(6)}`]);
    if (state.deResult)    rows.push(['DE', `${state.deResult.gen} camp. · ${state.deResult.best.toFixed(4)}`]);
    this.sidePanel.setStats([]);
    this.sidePanel.setNote('');
    this.sidePanel.setComparison(rows);

    this.sidePanel.clearSliders();
    this.sidePanel.addButton('↺ Volver al inicio', () => this.sceneManager.goto(0));
    this.sidePanel.addButton('🗺 Nuevo campo', () => {
      state.seed = Math.floor(Math.random() * 9999) + 1;
      this._points = this._buildConvergingPoints(state.seed);
    });

    this._setupSlides([{ lines: SUBTITLES.epilogue }]);
    this._gotoSlide(0);
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

  exit(state) {}
}
