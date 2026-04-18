// js/ui/Legend.js
// Leyenda flotante sobre el canvas: explica símbolos por escena.

export class Legend {
  constructor(elementId = 'canvas-legend') {
    this._el = document.getElementById(elementId);
  }

  set(title, items) {
    if (!this._el) return;
    const rows = items.map(({ type, color, label }) => {
      const swatch = type === 'arrow'
        ? `<span class="lg-arrow" style="--c:${color}"></span>`
        : type === 'ring'
          ? `<span class="lg-ring" style="--c:${color}"></span>`
          : type === 'ellipse'
            ? `<span class="lg-ellipse" style="--c:${color}"></span>`
            : `<span class="lg-dot" style="--c:${color}"></span>`;
      return `<div class="lg-row">${swatch}<span class="lg-text">${label}</span></div>`;
    }).join('');
    this._el.innerHTML = `<div class="lg-title">${title}</div>${rows}`;
    this._el.hidden = false;
  }

  clear() {
    if (!this._el) return;
    this._el.hidden = true;
    this._el.innerHTML = '';
  }
}
