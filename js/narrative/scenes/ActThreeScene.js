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
        onChange: v => { this._algo.NP = Math.round(v); this._algo.reset(this._seed); this._updatePanel(state); } },
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
