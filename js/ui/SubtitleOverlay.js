// js/ui/SubtitleOverlay.js
export class SubtitleOverlay {
  constructor(elementId = 'subtitle-text') {
    this._el = document.getElementById(elementId);
  }

  show(lines) {
    const render = () => {
      this._el.innerHTML = '';
      for (const line of lines) {
        const p = document.createElement('p');
        p.className = 'narrator-text';
        p.textContent = line;
        this._el.appendChild(p);
      }
      if (window.gsap) {
        gsap.fromTo(this._el, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
      } else {
        this._el.style.opacity = '1';
      }
    };

    if (this._el.children.length > 0 && window.gsap) {
      gsap.to(this._el, { opacity: 0, duration: 0.3, onComplete: render });
    } else {
      render();
    }
  }

  clear() {
    if (window.gsap) {
      gsap.to(this._el, { opacity: 0, duration: 0.4, onComplete: () => { this._el.innerHTML = ''; } });
    } else {
      this._el.style.opacity = '0';
      this._el.innerHTML = '';
    }
  }
}
