// js/render/PointsRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

const COL_DEFAULT  = [155, 176, 162];
const COL_BEST     = [255, 209, 102];
const COL_SEL_A    = [255, 209, 102];
const COL_SEL_B    = [239,  71, 111];
const COL_SEL_C    = [255, 160, 196];

export class PointsRenderer {
  constructor() {
    this.hoveredIdx = -1;
    this.highlightIndices = {};
  }

  draw(p5, population, options = {}) {
    if (!population) return;
    const best = population.best();
    const inds = population.individuals;
    const { deHighlight } = options;

    p5.noStroke();

    for (let i = 0; i < inds.length; i++) {
      const ind = inds[i];
      const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
      const isBest = ind === best;

      let col = COL_DEFAULT;
      let alpha = 255;
      let r = 7;

      if (deHighlight) {
        if (i === deHighlight.ai) col = COL_SEL_A;
        else if (i === deHighlight.bi) col = COL_SEL_B;
        else if (i === deHighlight.ci) col = COL_SEL_C;
        else { alpha = 80; }
      }

      if (isBest) { col = COL_BEST; r = 8; }

      if (isBest) {
        p5.fill(col[0], col[1], col[2], 60);
        p5.ellipse(cx, cy, r * 3.5, r * 3.5);
      }

      p5.fill(col[0], col[1], col[2], alpha);
      p5.ellipse(cx, cy, r * 2, r * 2);
    }
  }

  drawMutationCircle(p5, ind, sigma) {
    if (!ind) return;
    const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
    const pixelSigma = sigma * p5.width / 10.24;
    p5.noFill();
    p5.stroke(155, 176, 162, 80);
    p5.strokeWeight(1);
    p5.ellipse(cx, cy, pixelSigma * 2, pixelSigma * 2);
    p5.noStroke();
  }
}
