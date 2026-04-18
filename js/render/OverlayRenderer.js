// js/render/OverlayRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

export class OverlayRenderer {
  drawEllipse(p5, cmaes, alpha = 200) {
    if (!cmaes || !cmaes.showEllipse) return;
    const ep = cmaes.getEllipseParams(p5.width, p5.height);
    p5.push();
    p5.translate(ep.mx, ep.my);
    p5.rotate(ep.angle);
    p5.noFill();
    // Trazo exterior — densidad probabilística
    p5.stroke(61, 214, 160, 60);
    p5.strokeWeight(1.2);
    p5.ellipse(0, 0, ep.l1 * 4, ep.l2 * 4);
    // Trazo principal — 1σ
    p5.stroke(61, 214, 160, alpha);
    p5.strokeWeight(2);
    p5.ellipse(0, 0, ep.l1 * 2, ep.l2 * 2);
    p5.pop();
  }

  drawArrows(p5, stepInfo, targetIdx = 0) {
    if (!stepInfo || !stepInfo[targetIdx]) return;
    const { a, b, c, mutant } = stepInfo[targetIdx];
    const pa = worldToCanvas(a.x, a.y, p5.width, p5.height);
    const pb = worldToCanvas(b.x, b.y, p5.width, p5.height);
    const pc = worldToCanvas(c.x, c.y, p5.width, p5.height);
    const pm = worldToCanvas(mutant.x, mutant.y, p5.width, p5.height);

    p5.strokeWeight(2);
    this._arrow(p5, pc.cx, pc.cy, pb.cx, pb.cy, 232, 48, 96, 220);
    this._arrow(p5, pa.cx, pa.cy, pm.cx, pm.cy, 245, 166, 35, 230);

    p5.fill(245, 166, 35, 235);
    p5.noStroke();
    p5.ellipse(pm.cx, pm.cy, 11, 11);

    this._label(p5, pa.cx, pa.cy, 'a', 106, 200, 208);
    this._label(p5, pb.cx, pb.cy, 'b', 232, 48, 96);
    this._label(p5, pc.cx, pc.cy, 'c', 255, 168, 196);
    this._label(p5, pm.cx, pm.cy, 'a + F·(b−c)', 245, 166, 35);
  }

  drawSelectedHalos(p5, population, mu) {
    if (!population) return;
    const inds = population.individuals;
    const count = Math.min(mu, inds.length);
    p5.noStroke();
    for (let i = 0; i < count; i++) {
      const cx = p5.width  * (inds[i].x + 5.12) / 10.24;
      const cy = p5.height * (1 - (inds[i].y + 5.12) / 10.24);
      p5.fill(61, 214, 160, 40);
      p5.ellipse(cx, cy, 22, 22);
    }
  }

  _label(p5, x, y, text, r, g, b) {
    p5.noStroke();
    p5.fill(10, 9, 6, 200);
    p5.rect(x + 10, y - 18, p5.textWidth ? p5.textWidth(text) + 8 : 8 * text.length + 8, 16, 3);
    p5.fill(r, g, b, 245);
    p5.textFont?.('Inter');
    p5.textSize?.(12);
    p5.textAlign?.(p5.LEFT, p5.CENTER);
    p5.text(text, x + 14, y - 10);
  }

  _arrow(p5, x1, y1, x2, y2, r, g, b, a) {
    p5.stroke(r, g, b, a);
    p5.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 11;
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.noStroke();
    p5.fill(r, g, b, a);
    p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
    p5.pop();
  }
}
