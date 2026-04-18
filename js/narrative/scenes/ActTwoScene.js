// js/narrative/scenes/ActTwoScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';
import { CMAES } from '../../algorithms/CMAES.js';
import { ALGO_INFO } from '../algoInfo.js';

export class ActTwoScene extends Scene {
  constructor(deps) {
    super('act2');
    this.subtitle  = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.controls  = deps.controls;
    this.legend    = deps.legend;
    this._algo     = null;
    this._seed     = 42;
    this._running  = false;
    this.bestResults = deps.bestResults;
  }

  enter(state) {
    this._seed = state.seed ?? 42;
    this._running = false;
    this._algo = new CMAES({ seed: this._seed, lambda: 30, sigma: 0.5 });
    this.sidePanel.setHeader('Acto II', 'Covariance Matrix Adaptation (CMA-ES)');
    this.sidePanel.setInfo(ALGO_INFO.cmaes);
    this.legend?.set('Leyenda — CMA-ES', [
      { type: 'dot',     color: '#f5a623', label: 'Mejor pozo actual' },
      { type: 'dot',     color: '#c0a882', label: 'Pozo muestreado' },
      { type: 'dot',     color: 'rgba(61,214,160,0.5)', label: 'μ seleccionados (halo)' },
      { type: 'ellipse', color: '#3dd6a0', label: 'Distribución aprendida' },
    ]);
    this._updatePanel(state);
    this._setupSliders(state);

    this._setupSlides([
      { lines: SUBTITLES.act2.s21 },
      { lines: SUBTITLES.act2.s22, playEnabled: () => this._algo.bestFitness >= 0.01 && this._algo.generation < 500 },
      { lines: SUBTITLES.act2.s23 },
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
      { type: 'range', id: 'lambda', label: 'λ (pozos por campaña)', min: 10, max: 40, step: 1, value: 30, decimals: 0,
        onChange: v => { this._algo.setLambda(Math.round(v)); this._onParamChange(state); } },
      { type: 'toggle', id: 'ellipse', label: 'Elipse', value: true,
        options: [{ label: 'Mostrar', value: true }, { label: 'Ocultar', value: false }],
        onChange: v => { this._algo.showEllipse = v; } },
      { type: 'seed', id: 'seed', value: this._seed,
        onChange: v => { this._seed = v; this._algo.reset(v); this._onParamChange(state); } },
    ]);
  }

  _onParamChange(state) {
    if (this._algo.bestFitness < 0.01 || this._algo.generation >= 500) {
      this._algo.reset(this._seed);
    }
    this.controls.setPlayEnabled(true);
    this._updatePanel(state);
  }

  _updatePanel(state) {
    const a = this._algo;
    this.sidePanel.setTitle('CMA-ES (rank-1 update)');
    this.sidePanel.setStats([
      ['Campaña', a.generation],
      ['Mejor pozo', a.bestFitness.toFixed(6)],
      ['λ', a.lambda], ['σ', a.sigma.toFixed(4)],
    ]);
    this.sidePanel.setNote('');
    this.sidePanel.setProgress(Math.min(1, a.generation / 60));
    const rows = [];
    if (state?.esResult) rows.push(['ES', `${state.esResult.gen} camp.`]);
    if (a.generation > 0) rows.push(['CMA-ES', `${a.generation} camp.`]);
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
    this._updatePanel(state);

    if (this._algo.bestFitness < 0.01 || this._algo.generation >= 500) {
      this._running = false;
      this.controls.setPlaying(false);
      this.bestResults.cmaes = { gen: this._algo.generation, best: this._algo.bestFitness };
      this.controls.setPlayEnabled(false, '✓ Completado');
      this.sidePanel.setProgress(1);
    }
  }

  getPopulation() { return this._algo?.population; }
  getAlgo()       { return this._algo; }

  exit(state) {
    this._running = false;
    this.legend?.clear();
    state.cmaesResult = this.bestResults.cmaes;
  }
}
