// js/render/HeatmapRenderer.js
import { rastrigin } from '../core/rastrigin.js';

const LOW  = [8,   6,   4];    // negro petróleo (roca sin hidrocarburo)
const MID  = [90,  40,  8];    // marrón geológico (formación de transición)
const HIGH = [232, 133, 10];   // ámbar brillante (zona con hidrocarburo)

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export class HeatmapRenderer {
  constructor() {
    this._img = null;
    this._w = 0;
    this._h = 0;
    this._alpha = 255;
  }

  precompute(p5, w, h) {
    if (this._img && this._w === w && this._h === h) return;
    this._w = w; this._h = h;
    this._img = p5.createImage(w, h);
    this._img.loadPixels();

    const DOMAIN = 5.12;
    let maxVal = 0;
    const vals = new Float32Array(w * h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const wx = (px / w) * 2 * DOMAIN - DOMAIN;
        const wy = ((h - py) / h) * 2 * DOMAIN - DOMAIN;
        const v = rastrigin(wx, wy);
        vals[py * w + px] = v;
        if (v > maxVal) maxVal = v;
      }
    }

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const t = vals[py * w + px] / maxVal;
        const col = t < 0.5
          ? lerpColor(LOW, MID, t * 2)
          : lerpColor(MID, HIGH, (t - 0.5) * 2);
        const idx = (py * w + px) * 4;
        this._img.pixels[idx]   = col[0];
        this._img.pixels[idx+1] = col[1];
        this._img.pixels[idx+2] = col[2];
        this._img.pixels[idx+3] = this._alpha;
      }
    }
    this._img.updatePixels();
  }

  setAlpha(a) {
    this._alpha = a;
  }

  draw(p5) {
    if (!this._img) return;
    if (this._alpha < 255) {
      p5.push();
      p5.tint(255, this._alpha);
      p5.image(this._img, 0, 0, p5.width, p5.height);
      p5.pop();
    } else {
      p5.image(this._img, 0, 0, p5.width, p5.height);
    }
  }
}
