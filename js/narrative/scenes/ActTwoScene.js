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
