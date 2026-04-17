// js/core/rastrigin.js
export function rastrigin(x, y) {
  const A = 10;
  return 2 * A
    + (x * x - A * Math.cos(2 * Math.PI * x))
    + (y * y - A * Math.cos(2 * Math.PI * y));
}
