// js/core/Individual.js
import { rastrigin } from './rastrigin.js';
import { clamp, DOMAIN } from './math-utils.js';

export class Individual {
  constructor(x, y) {
    this.x = clamp(x, -DOMAIN, DOMAIN);
    this.y = clamp(y, -DOMAIN, DOMAIN);
    this.fitness = rastrigin(this.x, this.y);
  }

  clone() {
    const ind = new Individual(this.x, this.y);
    ind.fitness = this.fitness;
    return ind;
  }
}
