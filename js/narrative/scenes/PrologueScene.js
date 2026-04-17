// js/narrative/scenes/PrologueScene.js
import { Scene } from '../Scene.js';
import { SUBTITLES } from '../subtitles.js';

export class PrologueScene extends Scene {
  constructor(deps) {
    super('prologue');
    this.subtitle = deps.subtitle;
    this.sidePanel = deps.sidePanel;
    this.heatmap   = deps.heatmap;
    this.p5ref     = deps.p5ref;
    this._pulse = 0;
    this.showOptimum = true;
  }

  enter(state) {
    this.showOptimum = true;
    this._pulse = 0;
    this.heatmap.setAlpha(102);

    this.sidePanel.setTitle('—');
    this.sidePanel.setStats([]);
    this.sidePanel.setNote('Un terreno. Un óptimo escondido en (0, 0).');
    this.sidePanel.setComparison([]);
    this.sidePanel.clearSliders();

    this.subtitle.showSequence(SUBTITLES.prologue, 4000, () => {
      this.showOptimum = false;
    });
  }

  update(dt, state) {
    this._pulse += dt * 0.003;
  }

  drawExtra(p5) {
    if (!this.showOptimum) return;
    const cx = p5.width / 2;
    const cy = p5.height / 2;
    const r  = 10 + Math.sin(this._pulse) * 4;
    p5.noStroke();
    p5.fill(255, 209, 102, 60 + Math.sin(this._pulse) * 40);
    p5.ellipse(cx, cy, r * 3.5, r * 3.5);
    p5.fill(255, 209, 102, 220);
    p5.ellipse(cx, cy, r, r);
  }

  exit(state) {
    this.subtitle.clear();
    this.heatmap.setAlpha(255);
  }
}
