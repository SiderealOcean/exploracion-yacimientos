// js/core/EvolutionaryAlgorithm.js
import { Individual } from './Individual.js';
import { mulberry32, makeGaussian } from './rng.js';
import { DOMAIN } from './math-utils.js';

export class EvolutionaryAlgorithm {
  constructor(params = {}) {
    this.seed = params.seed ?? 42;
    this.generation = 0;
    this.population = null;
    this._initRng();
  }

  _initRng() {
    this._rng = mulberry32(this.seed);
    this._gauss = makeGaussian(this._rng);
  }

  _randomIndividual() {
    const x = (this._rng() * 2 - 1) * DOMAIN;
    const y = (this._rng() * 2 - 1) * DOMAIN;
    return new Individual(x, y);
  }

  reset(seed = this.seed) {
    this.seed = seed;
    this.generation = 0;
    this._initRng();
    this._initPopulation();
  }

  _initPopulation() {
    throw new Error('_initPopulation() debe implementarse en subclase');
  }

  step() {
    throw new Error('step() debe implementarse en subclase');
  }

  get bestFitness() {
    if (!this.population) return Infinity;
    const b = this.population.best();
    return b ? b.fitness : Infinity;
  }
}
