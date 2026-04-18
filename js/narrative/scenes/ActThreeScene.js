// js/narrative/scenes/ActThreeScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { DE } from '../../algorithms/DE.js';
import { ALGO_INFO } from '../algoInfo.js';

export class ActThreeScene extends Scene {
  constructor(deps) {
    super('act3');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this.legend    = deps.legend;
    this._algo     = null;
    this._seed     = 42;
    this._running  = false;
    this._highlightIdx = 0;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._running = false;
    this._algo = new DE({ seed: this._seed, F: 0.5, CR: 0.9, NP: 30 });
    this.sidePanel.setHeader('Acto III', 'Differential Evolution (DE)');
    this.sidePanel.setInfo(ALGO_INFO.de);
    this.legend?.set('Leyenda — DE', [
      { type: 'dot',   color: '#f5a623', label: 'Mejor pozo / candidato propuesto' },
      { type: 'dot',   color: '#6ac8d0', label: 'a — base' },
      { type: 'dot',   color: '#e83060', label: 'b — diferencia (+)' },
      { type: 'dot',   color: '#ffa8c4', label: 'c — diferencia (−)' },
      { type: 'arrow', color: '#e83060', label: 'b − c (dirección)' },
      { type: 'arrow', color: '#f5a623', label: 'a + F·(b − c)' },
    ]);
    this._updatePanel(state);
    this._setupSliders(state);

    this._setupSlides([
      { lines: SUBTITLES.act3.s31 },
      { lines: SUBTITLES.act3.s32 },
      { lines: SUBTITLES.act3.s33, playEnabled: () => this._algo.bestFitness >= 0.05 && this._algo.generation < 500 },
    ]);
    this._gotoSlide(0);

    this.controls.onPlay  = () => { this._running = true; };
    this.controls.onPause = () => { this._running = false; };
    this.controls.onReset = () => {
      this._algo.reset(this._seed);
      this._running = false;
      this.controls.setPlaying(false);
      this.controls.setPlayEnabled(true);
      this._updatePanel(state);
      this._gotoSlide(0);
    };
  }

  _setupSliders(state) {
    this.sidePanel.setSliders([
      { type: 'range', id: 'F', label: 'F (escala diferencial)', min: 0.1, max: 2.0, step: 0.05, value: 0.5, decimals: 2,
        onChange: v => { this._algo.F = v; this._onParamChange(state); } },
      { type: 'range', id: 'CR', label: 'CR (crossover)', min: 0.1, max: 1.0, step: 0.05, value: 0.9, decimals: 2,
        onChange: v => { this._algo.CR = v; this._onParamChange(state); } },
      { type: 'range', id: 'NP', label: 'NP (portafolio)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => { this._algo.NP = Math.round(v); this._algo.reset(this._seed); this._onParamChange(state); } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._algo.reset(v); this._onParamChange(state); } },
    ]);
  }

  _onParamChange(state) {
    if (this._algo.bestFitness < 0.05 || this._algo.generation >= 500) {
      this._algo.reset(this._seed);
    }
    this.controls.setPlayEnabled(true);
    this._updatePanel(state);
  }

  _updatePanel(state) {
    const a = this._algo;
    this.sidePanel.setTitle('Differential Evolution (DE/rand/1/bin)');
    this.sidePanel.setStats([
      ['Campaña', a.generation],
      ['Mejor pozo', a.bestFitness.toFixed(4)],
      ['F', a.F.toFixed(2)], ['CR', a.CR.toFixed(2)], ['NP', a.NP],
    ]);
    this.sidePanel.setNote('');
    this.sidePanel.setProgress(Math.min(1, a.generation / 100));
    const rows = [];
    if (state?.esResult)    rows.push(['ES', `${state.esResult.gen} camp.`]);
    if (state?.cmaesResult) rows.push(['CMA-ES', `${state.cmaesResult.gen} camp.`]);
    if (a.generation > 0)   rows.push(['DE', `${a.generation} camp.`]);
    this.sidePanel.setComparison(rows);
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
    this._highlightIdx = Math.floor(Math.random() * this._algo.NP);
    this._updatePanel(state);

    if (this._algo.bestFitness < 0.05 || this._algo.generation >= 500) {
      this._running = false;
      this.controls.setPlaying(false);
      this.controls.setPlayEnabled(false, '✓ Completado');
      this.sidePanel.setProgress(1);
      this.bestResults.de = { gen: this._algo.generation, best: this._algo.bestFitness };
    }
  }

  getPopulation()    { return this._algo?.population; }
  getAlgo()          { return this._algo; }
  getHighlightIdx()  { return this._highlightIdx; }

  exit(state) {
    this._running = false;
    this.legend?.clear();
    state.deResult = this.bestResults.de;
  }
}
