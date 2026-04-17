// js/ui/SidePanel.js
export class SidePanel {
  constructor() {
    this._algoEl   = document.getElementById('tp-algo');
    this._statsEl  = document.getElementById('tp-stats');
    this._noteEl   = document.getElementById('tp-note');
    this._compEl   = document.getElementById('tp-comparison');
    this._slidersEl = document.getElementById('sliders-area');
    this._sliderDefs = [];
    this._sliderEls  = [];
  }

  setTitle(text) {
    this._algoEl.textContent = text;
  }

  setStats(rows) {
    this._statsEl.innerHTML = rows.map(([label, val]) =>
      `<div class="stat-row"><span>${label}</span><span class="mono-num">${val}</span></div>`
    ).join('');
  }

  setNote(text) {
    this._noteEl.textContent = text;
  }

  setComparison(rows) {
    if (!rows || rows.length === 0) { this._compEl.innerHTML = ''; return; }
    this._compEl.innerHTML = rows.map(([algo, val]) =>
      `<div class="row"><span class="algo-name">${algo}</span><span class="algo-val">${val}</span></div>`
    ).join('');
  }

  setSliders(defs) {
    this._sliderDefs = defs;
    this._sliderEls  = [];
    this._slidersEl.innerHTML = '';

    for (const def of defs) {
      if (def.type === 'range') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const lbl = document.createElement('label');
        lbl.innerHTML = `${def.label} <span id="sv-${def.id}">${Number(def.value).toFixed(def.decimals ?? 2)}</span>`;
        const input = document.createElement('input');
        input.type = 'range';
        input.min = def.min; input.max = def.max;
        input.step = def.step ?? 0.01;
        input.value = def.value;
        input.addEventListener('input', () => {
          const v = parseFloat(input.value);
          document.getElementById(`sv-${def.id}`).textContent = v.toFixed(def.decimals ?? 2);
          if (def.onChange) def.onChange(v);
        });
        grp.appendChild(lbl); grp.appendChild(input);
        this._slidersEl.appendChild(grp);
        this._sliderEls.push(input);
      } else if (def.type === 'toggle') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const row = document.createElement('div');
        row.className = 'toggle-group';
        for (const opt of def.options) {
          const btn = document.createElement('button');
          btn.className = 'btn-toggle' + (opt.value === def.value ? ' active' : '');
          btn.textContent = opt.label;
          btn.addEventListener('click', () => {
            row.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (def.onChange) def.onChange(opt.value);
          });
          row.appendChild(btn);
        }
        grp.appendChild(row);
        this._slidersEl.appendChild(grp);
      } else if (def.type === 'seed') {
        const grp = document.createElement('div');
        grp.className = 'slider-group';
        const lbl = document.createElement('label');
        lbl.textContent = 'Seed';
        const input = document.createElement('input');
        input.type = 'range'; input.min = 1; input.max = 9999; input.step = 1;
        input.value = def.value;
        const sp = document.createElement('span');
        sp.className = 'mono-num'; sp.style.fontSize = '14px'; sp.style.color = 'var(--text-muted)';
        sp.textContent = def.value;
        input.addEventListener('input', () => {
          const v = parseInt(input.value);
          sp.textContent = v;
          if (def.onChange) def.onChange(v);
        });
        grp.appendChild(lbl); grp.appendChild(input); grp.appendChild(sp);
        this._slidersEl.appendChild(grp);
      }
    }
  }

  clearSliders() {
    this._slidersEl.innerHTML = '';
    this._sliderEls = [];
  }

  addButton(label, onClick, id = null) {
    const btn = document.createElement('button');
    btn.className = 'ctrl-btn';
    btn.style.width = '100%';
    btn.style.marginTop = '0.5rem';
    btn.textContent = label;
    if (id) btn.id = id;
    btn.addEventListener('click', onClick);
    this._slidersEl.appendChild(btn);
    return btn;
  }
}
