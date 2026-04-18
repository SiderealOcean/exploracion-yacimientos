// js/render/ParamVisuals.js
// Ocho ilustraciones animadas: σ μ λ (ES) · λ C (CMA-ES) · NP F CR (DE).

const COL_TXT = [192, 168, 130];

export const VISUALS = { sigma, mu, lambdaES, lambdaCMA, C, NP, F, CR };

function sigma(p5, cx, cy, size, color, t) {
  const r = size / 2;
  const breath = 0.85 + 0.15 * Math.sin(t * Math.PI * 4);
  p5.noFill();
  p5.stroke(color[0], color[1], color[2], 180);
  p5.strokeWeight(1);
  dash(p5, [4, 5]);
  p5.ellipse(cx, cy, size * breath, size * breath);
  dash(p5, []);
  p5.stroke(color[0], color[1], color[2], 210);
  p5.strokeWeight(1.5);
  p5.line(cx, cy, cx + r * 0.95 * breath, cy);
  p5.noStroke();
  p5.fill(color[0], color[1], color[2], 240);
  p5.ellipse(cx, cy, 14, 14);
  const ch = [[.30,-.20],[-.40,.30],[.50,.42],[-.30,-.42],[.10,.50],[-.50,-.05],[.42,-.35],[-.18,.20]];
  const visible = Math.floor(t * ch.length);
  for (let i = 0; i < ch.length; i++) {
    p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], i < visible ? 230 : 0);
    p5.ellipse(cx + ch[i][0] * r * breath, cy + ch[i][1] * r * breath, 7, 7);
  }
}

function mu(p5, cx, cy, size, color, t) {
  const r = size / 2;
  const pos = [[-.7,-.3],[.5,.4],[-.2,.6],[.8,-.2],[-.5,0],[.1,-.6],[.6,.7],[-.8,.5],[.3,-.4],[-.4,-.7],[0,.3],[.7,-.6]];
  const fit = [.3,.5,.9,.2,.7,.4,.85,.6,.75,.95,.55,.45];
  const ranked = fit.map((f, i) => ({ f, i })).sort((a, b) => b.f - a.f);
  const top = new Set(ranked.slice(0, 4).map(o => o.i));
  const dim = Math.max(0, Math.min(1, (t - 0.4) * 2));
  for (let i = 0; i < pos.length; i++) {
    const isMu = top.has(i);
    p5.noStroke();
    if (isMu) p5.fill(color[0], color[1], color[2], 240);
    else      p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 220 - dim * 150);
    p5.ellipse(cx + pos[i][0] * r, cy + pos[i][1] * r, isMu ? 13 : 9, isMu ? 13 : 9);
  }
}

function lambdaES(p5, cx, cy, size, color, t) {
  const r = size / 2;
  const parents = [[-.4,-.3],[.3,-.4],[-.2,.4],[.5,.2]];
  const ch = [];
  let s = 12345; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (const [px, py] of parents) for (let k = 0; k < 7; k++) {
    const a = rnd() * Math.PI * 2, d = 0.13 + rnd() * 0.14;
    ch.push([px + Math.cos(a) * d, py + Math.sin(a) * d]);
  }
  p5.noStroke();
  for (const [px, py] of parents) {
    p5.fill(color[0], color[1], color[2], 240);
    p5.ellipse(cx + px * r, cy + py * r, 14, 14);
  }
  const visible = Math.floor(t * ch.length);
  for (let i = 0; i < visible; i++) {
    p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 220);
    p5.ellipse(cx + ch[i][0] * r, cy + ch[i][1] * r, 7, 7);
  }
}

function lambdaCMA(p5, cx, cy, size, color, t) {
  const r = size / 2;
  let s = 999; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const pts = []; for (let i = 0; i < 18; i++) pts.push([(rnd() - .5) * 1.2, (rnd() - .5) * 0.6]);
  p5.noStroke();
  p5.fill(color[0], color[1], color[2], 90);
  p5.ellipse(cx, cy, 10, 10);
  for (let i = 0; i < pts.length; i++) {
    const tt = Math.min(1, t * 2 - i / pts.length * 0.5);
    if (tt <= 0) continue;
    p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 230);
    p5.ellipse(cx + pts[i][0] * r * tt, cy + pts[i][1] * r * tt, 7, 7);
  }
}

function C(p5, cx, cy, size, color, t) {
  const angle = -0.45 + Math.sin(t * Math.PI * 2) * 0.4;
  const stretch = 0.7 + Math.sin(t * Math.PI * 2 + 1) * 0.25;
  p5.push();
  p5.translate(cx, cy);
  p5.rotate(angle);
  p5.noFill();
  p5.stroke(color[0], color[1], color[2], 60);
  p5.strokeWeight(1.2);
  p5.ellipse(0, 0, size * 1.15 * stretch, size * 0.55);
  p5.stroke(color[0], color[1], color[2], 220);
  p5.strokeWeight(2);
  p5.ellipse(0, 0, size * 0.78 * stretch, size * 0.38);
  p5.pop();
  const cosA = Math.cos(angle), sinA = Math.sin(angle);
  const pts = [[-.30,.06],[.18,-.08],[-.10,.13],[.28,.02],[-.36,-.05],[.08,.16],[.24,-.13],[-.20,-.08]];
  p5.noStroke();
  p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 230);
  for (const [px, py] of pts) {
    const x = px * size * stretch, y = py * size;
    p5.ellipse(cx + x * cosA - y * sinA, cy + x * sinA + y * cosA, 7, 7);
  }
}

function NP(p5, cx, cy, size, color, t) {
  const cols = 6, rows = 2, sp = size * 0.14;
  const sx = cx - (cols - 1) * sp / 2, sy = cy - (rows - 1) * sp / 2;
  const active = Math.floor(t * cols * rows) % (cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const x = sx + (i % cols) * sp, y = sy + Math.floor(i / cols) * sp;
    p5.noStroke();
    if (i === active) { p5.fill(color[0], color[1], color[2], 240); p5.ellipse(x, y, 14, 14); }
    else              { p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 200); p5.ellipse(x, y, 10, 10); }
  }
}

function F(p5, cx, cy, size, color, t) {
  const r = size / 2;
  const f = 0.25 + (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) * 0.7;
  const a = { x: cx - r * 0.6, y: cy + r * 0.3 };
  const b = { x: cx + r * 0.5, y: cy - r * 0.4 };
  const c = { x: cx - r * 0.3, y: cy - r * 0.5 };
  const m = { x: a.x + f * (b.x - c.x), y: a.y + f * (b.y - c.y) };
  arrow(p5, c.x, c.y, b.x, b.y, color[0], color[1], color[2], 200);
  arrow(p5, a.x, a.y, m.x, m.y, 245, 166, 35, 230);
  p5.noStroke();
  p5.fill(106, 200, 208, 240); p5.ellipse(a.x, a.y, 12, 12);
  p5.fill(color[0], color[1], color[2], 240); p5.ellipse(b.x, b.y, 12, 12);
  p5.fill(255, 168, 196, 240); p5.ellipse(c.x, c.y, 12, 12);
  p5.fill(245, 166, 35, 245); p5.ellipse(m.x, m.y, 11, 11);
  p5.fill(245, 166, 35, 235);
  p5.textFont('JetBrains Mono'); p5.textStyle(p5.NORMAL); p5.textSize(13);
  p5.textAlign(p5.LEFT, p5.CENTER);
  p5.text(`F = ${f.toFixed(2)}`, cx + r * 0.7, cy);
}

function CR(p5, cx, cy, size, color, t) {
  const cellW = size * 0.18, cellH = size * 0.26, sp = cellW * 0.3;
  const sx = cx - (cellW * 2 + sp) / 2, cellY = cy - cellH / 2;
  const states = [[1,1],[1,0],[0,1],[1,1]];
  const state = states[Math.floor(t * 8) % states.length];
  for (let i = 0; i < 2; i++) {
    const x = sx + i * (cellW + sp);
    p5.noStroke();
    if (state[i]) p5.fill(color[0], color[1], color[2], 230);
    else          p5.fill(COL_TXT[0], COL_TXT[1], COL_TXT[2], 200);
    p5.rect(x, cellY, cellW, cellH, 3);
    p5.fill(10, 9, 6, 240);
    p5.textFont('JetBrains Mono'); p5.textStyle(p5.NORMAL); p5.textSize(18);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text(i === 0 ? 'x' : 'y', x + cellW / 2, cellY + cellH / 2);
  }
}

function arrow(p5, x1, y1, x2, y2, r, g, b, a) {
  p5.stroke(r, g, b, a); p5.strokeWeight(1.5);
  p5.line(x1, y1, x2, y2);
  const ang = Math.atan2(y2 - y1, x2 - x1), len = 9;
  p5.push(); p5.translate(x2, y2); p5.rotate(ang);
  p5.noStroke(); p5.fill(r, g, b, a);
  p5.triangle(0, 0, -len, -len / 2, -len, len / 2);
  p5.pop();
}

function dash(p5, arr) {
  if (p5.drawingContext?.setLineDash) p5.drawingContext.setLineDash(arr);
}
