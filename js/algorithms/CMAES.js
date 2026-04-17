// js/algorithms/CMAES.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class CMAES extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.lambda = params.lambda ?? 30;
    this.mu     = Math.floor(this.lambda / 2);
    this.sigma  = params.sigma  ?? 0.5;
    this.showEllipse = true;
    this.reset(this.seed);
  }

  _initPopulation() {
    this.m  = [0, 0];
    this.C  = [[1, 0], [0, 1]];
    this.pc = [0, 0];
    this.ps = [0, 0];
    this._weights = this._buildWeights();
    this._mueff   = this._computeMueff();

    const n = 2;
    this._cs   = (this._mueff + 2) / (n + this._mueff + 5);
    this._cc   = (4 + this._mueff / n) / (n + 4 + 2 * this._mueff / n);
    this._c1   = 2 / ((n + 1.3) ** 2 + this._mueff);
    this._cmu  = Math.min(1 - this._c1,
                   2 * (this._mueff - 2 + 1 / this._mueff) / ((n + 2) ** 2 + this._mueff));
    this._damps = 1 + 2 * Math.max(0, Math.sqrt((this._mueff - 1) / (n + 1)) - 1) + this._cs;
    this._chiN  = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));

    const inds = [];
    for (let i = 0; i < this.lambda; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
  }

  _buildWeights() {
    const w = [];
    for (let i = 0; i < this.mu; i++) w.push(Math.log(this.mu + 0.5) - Math.log(i + 1));
    const s = w.reduce((a, b) => a + b, 0);
    return w.map(x => x / s);
  }

  _computeMueff() {
    const s = this._weights.reduce((a, b) => a + b * b, 0);
    return 1 / s;
  }

  _sampleFromC() {
    const [[c00, c01], [c10, c11]] = this.C;
    const l1 = Math.sqrt(Math.max(0, c00));
    const l21 = l1 === 0 ? 0 : c10 / l1;
    const l22sq = c11 - l21 * l21;
    const l22 = Math.sqrt(Math.max(0, l22sq));

    const z1 = this._gauss();
    const z2 = this._gauss();
    return [l1 * z1, l21 * z1 + l22 * z2];
  }

  step() {
    const samples = [];
    for (let i = 0; i < this.lambda; i++) {
      const [dx, dy] = this._sampleFromC();
      const x = clamp(this.m[0] + this.sigma * dx, -DOMAIN, DOMAIN);
      const y = clamp(this.m[1] + this.sigma * dy, -DOMAIN, DOMAIN);
      samples.push({ ind: new Individual(x, y), z: [dx, dy] });
    }
    samples.sort((a, b) => a.ind.fitness - b.ind.fitness);

    const selectedInds = samples.slice(0, this.mu);

    const newM = [0, 0];
    for (let i = 0; i < this.mu; i++) {
      newM[0] += this._weights[i] * selectedInds[i].ind.x;
      newM[1] += this._weights[i] * selectedInds[i].ind.y;
    }

    const step = [(newM[0] - this.m[0]) / this.sigma, (newM[1] - this.m[1]) / this.sigma];

    const cs = this._cs, damps = this._damps, chiN = this._chiN;
    this.ps[0] = (1 - cs) * this.ps[0] + Math.sqrt(cs * (2 - cs) * this._mueff) * step[0];
    this.ps[1] = (1 - cs) * this.ps[1] + Math.sqrt(cs * (2 - cs) * this._mueff) * step[1];

    const psNorm = Math.sqrt(this.ps[0] ** 2 + this.ps[1] ** 2);
    const hsig = psNorm / chiN / Math.sqrt(1 - (1 - cs) ** (2 * (this.generation + 1))) < 1.4 + 2 / (2 + 1) ? 1 : 0;

    const cc = this._cc;
    this.pc[0] = (1 - cc) * this.pc[0] + hsig * Math.sqrt(cc * (2 - cc) * this._mueff) * step[0];
    this.pc[1] = (1 - cc) * this.pc[1] + hsig * Math.sqrt(cc * (2 - cc) * this._mueff) * step[1];

    const c1 = this._c1, cmu = this._cmu;
    const oldC = this.C;
    this.C = [
      [
        (1 - c1 - cmu) * oldC[0][0] + c1 * this.pc[0] * this.pc[0] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[0] * si.z[0], 0),
        (1 - c1 - cmu) * oldC[0][1] + c1 * this.pc[0] * this.pc[1] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[0] * si.z[1], 0),
      ],
      [
        (1 - c1 - cmu) * oldC[1][0] + c1 * this.pc[1] * this.pc[0] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[1] * si.z[0], 0),
        (1 - c1 - cmu) * oldC[1][1] + c1 * this.pc[1] * this.pc[1] + cmu * selectedInds.reduce((s, si, i) => s + this._weights[i] * si.z[1] * si.z[1], 0),
      ]
    ];

    this.sigma *= Math.exp((cs / damps) * (psNorm / chiN - 1));
    this.sigma = clamp(this.sigma, 1e-8, 5.0);

    this.m = newM;
    this.population = new Population(samples.map(s => s.ind));
    this.generation++;
  }

  getEllipseParams(canvasW, canvasH) {
    const { cx: mx, cy: my } = { cx: canvasW * (this.m[0] + 5.12) / 10.24, cy: canvasH * (1 - (this.m[1] + 5.12) / 10.24) };
    const scale = (canvasW / 10.24) * this.sigma * 2;
    const [[c00, c01], [, c11]] = this.C;
    const angle = Math.atan2(2 * c01, c00 - c11) / 2;
    const trace = c00 + c11;
    const det = c00 * c11 - c01 * c01;
    const disc = Math.sqrt(Math.max(0, (trace / 2) ** 2 - det));
    const l1 = Math.sqrt(Math.max(0, trace / 2 + disc)) * scale;
    const l2 = Math.sqrt(Math.max(0, trace / 2 - disc)) * scale;
    return { mx, my, angle, l1: Math.max(l1, 2), l2: Math.max(l2, 2) };
  }
}
