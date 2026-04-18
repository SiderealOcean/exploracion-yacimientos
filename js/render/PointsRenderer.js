// js/render/PointsRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

const COL_DEFAULT  = [192, 168, 130];
const COL_BEST     = [245, 166, 35];
const COL_SEL_A    = [106, 200, 208];
const COL_SEL_B    = [232,  48,  96];
const COL_SEL_C    = [255, 168, 196];

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
    const pulse = 1 + Math.sin(p5.frameCount * 0.08) * 0.12;

    p5.noStroke();

    for (let i = 0; i < inds.length; i++) {
      const ind = inds[i];
      const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
      const isBest = ind === best;

      let col = COL_DEFAULT;
      let alpha = 240;
      let r = 7;

      if (deHighlight) {
        if (i === deHighlight.ai) col = COL_SEL_A;
        else if (i === deHighlight.bi) col = COL_SEL_B;
        else if (i === deHighlight.ci) col = COL_SEL_C;
        else { alpha = 70; }
      }

      if (isBest) { col = COL_BEST; r = 8; }

      if (isBest) {
        p5.fill(col[0], col[1], col[2], 28);
        p5.ellipse(cx, cy, r * 4.6 * pulse, r * 4.6 * pulse);
        p5.fill(col[0], col[1], col[2], 110);
        p5.ellipse(cx, cy, r * 2.8, r * 2.8);
      }

      p5.fill(col[0], col[1], col[2], alpha);
      p5.ellipse(cx, cy, r * 2, r * 2);
    }
  }

  drawMutationCircle(p5, ind, sigma) {
    if (!ind) return;
    const { cx, cy } = worldToCanvas(ind.x, ind.y, p5.width, p5.height);
    const pixelSigma = sigma * p5.width / 10.24;
    const d = pixelSigma * 2;

    p5.push();
    p5.noFill();
    p5.stroke(245, 166, 35, 150);
    p5.strokeWeight(1);
    if (p5.drawingContext?.setLineDash) p5.drawingContext.setLineDash([4, 5]);
    p5.ellipse(cx, cy, d, d);
    if (p5.drawingContext?.setLineDash) p5.drawingContext.setLineDash([]);
    p5.pop();
    p5.noStroke();
  }
}
