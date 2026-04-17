// js/core/math-utils.js
export const DOMAIN = 5.12;

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function mapRange(v, inMin, inMax, outMin, outMax) {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function worldToCanvas(wx, wy, canvasW, canvasH) {
  return {
    cx: mapRange(wx, -DOMAIN, DOMAIN, 0, canvasW),
    cy: mapRange(wy, -DOMAIN, DOMAIN, canvasH, 0),
  };
}

export function canvasToWorld(cx, cy, canvasW, canvasH) {
  return {
    wx: mapRange(cx, 0, canvasW, -DOMAIN, DOMAIN),
    wy: mapRange(cy, canvasH, 0, -DOMAIN, DOMAIN),
  };
}
