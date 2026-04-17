// js/algorithms/DE.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class DE extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.F  = params.F  ?? 0.5;
    this.CR = params.CR ?? 0.9;
    this.NP = params.NP ?? 30;
    this.stepInfo = null;
    this.reset(this.seed);
  }

  _initPopulation() {
    const inds = [];
    for (let i = 0; i < this.NP; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
    this.stepInfo = null;
  }

  _pickThreeDistinct(exclude) {
    const pool = [];
    for (let i = 0; i < this.NP; i++) if (i !== exclude) pool.push(i);
    const a = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    const b = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    const c = pool.splice(Math.floor(this._rng() * pool.length), 1)[0];
    return [a, b, c];
  }

  step() {
    const newInds = [];
    const lastStepInfo = [];

    for (let i = 0; i < this.NP; i++) {
      const [ai, bi, ci] = this._pickThreeDistinct(i);
      const a = this.population.individuals[ai];
      const b = this.population.individuals[bi];
      const c = this.population.individuals[ci];

      const mx = clamp(a.x + this.F * (b.x - c.x), -DOMAIN, DOMAIN);
      const my = clamp(a.y + this.F * (b.y - c.y), -DOMAIN, DOMAIN);
      const mutant = new Individual(mx, my);

      const jRand = Math.floor(this._rng() * 2);
      const tx = (this._rng() < this.CR || jRand === 0) ? mutant.x : this.population.individuals[i].x;
      const ty = (this._rng() < this.CR || jRand === 1) ? mutant.y : this.population.individuals[i].y;
      const trial = new Individual(tx, ty);

      const winner = trial.fitness <= this.population.individuals[i].fitness ? trial : this.population.individuals[i];
      newInds.push(winner);
      lastStepInfo.push({ ai, bi, ci, a, b, c, mutant, trial, winner });
    }

    this.population = new Population(newInds);
    this.stepInfo = lastStepInfo;
    this.generation++;
  }
}
