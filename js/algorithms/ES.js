// js/algorithms/ES.js
import { EvolutionaryAlgorithm } from '../core/EvolutionaryAlgorithm.js';
import { Individual } from '../core/Individual.js';
import { Population } from '../core/Population.js';
import { clamp, DOMAIN } from '../core/math-utils.js';

export class ES extends EvolutionaryAlgorithm {
  constructor(params = {}) {
    super(params);
    this.mu     = params.mu     ?? 10;
    this.lambda = params.lambda ?? 30;
    this.sigma  = params.sigma  ?? 0.5;
    this.plusMode = params.plusMode ?? false;
    this.reset(this.seed);
  }

  _initPopulation() {
    const inds = [];
    for (let i = 0; i < this.lambda; i++) inds.push(this._randomIndividual());
    this.population = new Population(inds);
  }

  step() {
    this.population.sortByFitness();
    const parents = this.population.individuals.slice(0, this.mu);
    const offspring = [];

    for (let i = 0; i < this.lambda; i++) {
      const p = parents[i % this.mu];
      const x = clamp(p.x + this._gauss(0, this.sigma), -DOMAIN, DOMAIN);
      const y = clamp(p.y + this._gauss(0, this.sigma), -DOMAIN, DOMAIN);
      offspring.push(new Individual(x, y));
    }

    if (this.plusMode) {
      const pool = [...parents, ...offspring];
      pool.sort((a, b) => a.fitness - b.fitness);
      this.population = new Population(pool.slice(0, this.lambda));
    } else {
      this.population = new Population(offspring);
    }

    this.generation++;
  }
}
