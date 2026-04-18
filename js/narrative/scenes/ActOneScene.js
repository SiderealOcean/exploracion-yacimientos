// js/narrative/scenes/ActOneScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { ES } from '../../algorithms/ES.js';
import { ALGO_INFO } from '../algoInfo.js';

export class ActOneScene extends Scene {
  constructor(deps) {
    super('act1');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this.legend    = deps.legend;
    this._algo     = null;
    this._seed     = 42;
    this._running  = false;
    this._genTarget = 180;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._running = false;
    this._algo = new ES({ seed: this._seed, mu: 10, lambda: 30, sigma: 0.5 });
    this.sidePanel.setHeader('Acto I', 'Evolution Strategies (ES)');
    this.sidePanel.setInfo(ALGO_INFO.es);
    this.legend?.set('Leyenda — ES', [
      { type: 'dot',  color: '#f5a623', label: 'Mejor pozo actual' },
      { type: 'dot',  color: '#c0a882', label: 'Pozo de la población' },
      { type: 'ring', color: '#f5a623', label: 'Radio σ de mutación' },
    ]);
    this._updatePanel();
    this._setupSliders(state);

    this._setupSlides([
      { lines: SUBTITLES.act1.s11 },
      { lines: SUBTITLES.act1.s12, playEnabled: () => this._algo.generation < this._genTarget },
      { lines: SUBTITLES.act1.s13 },
    ]);
    this._gotoSlide(0);

    this.controls.onPlay  = () => { this._running = true; };
    this.controls.onPause = () => { this._running = false; };
    this.controls.onReset = () => this._reset(state);
  }

  _setupSliders(state) {
    this.sidePanel.setSliders([
      { type: 'range', id: 'sigma', label: 'σ (desplazamiento)', min: 0.01, max: 2.0, step: 0.01, value: 0.5, decimals: 2,
        onChange: v => { this._algo.sigma = v; this._onParamChange(); } },
      { type: 'range', id: 'mu', label: 'μ (pozos base)', min: 5, max: 20, step: 1, value: 10, decimals: 0,
        onChange: v => {
          this._algo.mu = Math.min(Math.round(v), this._algo.lambda);
          this._onParamChange();
        } },
      { type: 'range', id: 'lambda', label: 'λ (pozos nuevos)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => {
          this._algo.lambda = Math.round(v);
          if (this._algo.mu > this._algo.lambda) this._algo.mu = this._algo.lambda;
          this._onParamChange();
        } },
      { type: 'toggle', id: 'mode', label: 'Modo', value: false,
        options: [{ label: '(μ,λ)', value: false }, { label: '(μ+λ)', value: true }],
        onChange: v => { this._algo.plusMode = v; this._onParamChange(); } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._reset(state); } },
    ]);
  }

  _onParamChange() {
    if (this._algo.generation >= this._genTarget) {
      this._algo.reset(this._seed);
    }
    this.controls.setPlayEnabled(true);
    this._updatePanel();
  }

  _reset(state) {
    this._algo.reset(this._seed);
    this._running = false;
    this.controls.setPlaying(false);
    this.controls.setPlayEnabled(true);
    this._updatePanel();
    this._gotoSlide(0);
  }

  _updatePanel() {
    const a = this._algo;
    this.sidePanel.setTitle('Evolution Strategies (μ,λ)-ES');
    this.sidePanel.setStats([
      ['Campaña', a.generation],
      ['Mejor pozo', a.bestFitness.toFixed(4)],
      ['μ', a.mu], ['λ', a.lambda], ['σ', a.sigma.toFixed(3)],
    ]);
    this.sidePanel.setNote(SUBTITLES.act1.note);
    this.sidePanel.setProgress(Math.min(1, a.generation / this._genTarget));
    if (a.generation >= this._genTarget) {
      this.bestResults.es = { gen: a.generation, best: a.bestFitness };
      this.sidePanel.setComparison([
        ['ES (este campo)', `${a.generation} camp. · ${a.bestFitness.toFixed(3)}`],
      ]);
    }
  }

  update(dt, state) {
    if (!this._running) return;
    if (this._algo.generation >= 500) { this._running = false; return; }
    this._stepAcc = (this._stepAcc ?? 0) + (state.speed ?? 1);
    const steps = Math.floor(this._stepAcc);
    this._stepAcc -= steps;
    for (let i = 0; i < steps; i++) {
      if (this._algo.generation < 500) this._algo.step();
    }
    if (steps === 0) return;
    this._updatePanel();

    if (this._algo.generation >= this._genTarget) {
      this._running = false;
      this.controls.setPlaying(false);
      this.bestResults.es = { gen: this._algo.generation, best: this._algo.bestFitness };
      this.controls.setPlayEnabled(false, '✓ Completado');
    }
  }

  getPopulation() { return this._algo?.population; }
  getAlgo()       { return this._algo; }

  exit(state) {
    this._running = false;
    this.sidePanel.clearDiagram();
    this.legend?.clear();
    state.esResult = this.bestResults.es;
  }
}
