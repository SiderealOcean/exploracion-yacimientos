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
