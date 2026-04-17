// js/render/OverlayRenderer.js
import { worldToCanvas } from '../core/math-utils.js';

export class OverlayRenderer {
  drawEllipse(p5, cmaes, alpha = 180) {
    if (!cmaes || !cmaes.showEllipse) return;
    const ep = cmaes.getEllipseParams(p5.width, p5.height);
    p5.push();
    p5.translate(ep.mx, ep.my);
    p5.rotate(ep.angle);
    p5.noFill();
    p5.stroke(6, 214, 160, alpha);
    p5.strokeWeight(1.5);
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

    p5.strokeWeight(1.5);
    this._arrow(p5, pc.cx, pc.cy, pb.cx, pb.cy, 239, 71, 111, 200);
    this._arrow(p5, pa.cx, pa.cy, pm.cx, pm.cy, 255, 209, 102, 200);

    p5.fill(255, 209, 102, 220);
    p5.noStroke();
    p5.ellipse(pm.cx, pm.cy, 10, 10);
  }

  _arrow(p5, x1, y1, x2, y2, r, g, b, a) {
    p5.stroke(r, g, b, a);
    p5.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 8;
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(angle);
    p5.noStroke();
    p5.fill(r, g, b, a);
    p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
    p5.pop();
  }
}
