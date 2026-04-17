// js/core/Population.js
export class Population {
  constructor(individuals = []) {
    this.individuals = individuals;
  }

  get size() { return this.individuals.length; }

  best() {
    if (this.individuals.length === 0) return null;
    return this.individuals.reduce((b, i) => i.fitness < b.fitness ? i : b);
  }

  mean() {
    const n = this.individuals.length;
    if (n === 0) return { x: 0, y: 0 };
    const mx = this.individuals.reduce((s, i) => s + i.x, 0) / n;
    const my = this.individuals.reduce((s, i) => s + i.y, 0) / n;
    return { x: mx, y: my };
  }

  sortByFitness() {
    this.individuals.sort((a, b) => a.fitness - b.fitness);
  }
}
