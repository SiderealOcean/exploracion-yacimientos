// js/ui/SubtitleOverlay.js
export class SubtitleOverlay {
  constructor(elementId = 'subtitle-text') {
    this._el = document.getElementById(elementId);
    this._queue = [];
    this._running = false;
    this._currentTimeout = null;
  }

  showSequence(lines, intervalMs = 6000, onDone = null) {
    this._queue = [...lines];
    this._onDone = onDone;
    this._running = true;
    this._showNext(intervalMs);
  }

  _showNext(intervalMs) {
    if (!this._running || this._queue.length === 0) {
      if (this._onDone) this._onDone();
      return;
    }
    const line = this._queue.shift();
    this._fadeIn(line);
    this._currentTimeout = setTimeout(() => {
      this._fadeOut(() => this._showNext(intervalMs));
    }, intervalMs);
  }

  _fadeIn(text) {
    this._el.textContent = text;
    if (window.gsap) {
      gsap.to(this._el, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    } else {
      this._el.style.opacity = '1';
    }
  }

  _fadeOut(cb) {
    if (window.gsap) {
      gsap.to(this._el, { opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: cb });
    } else {
      this._el.style.opacity = '0';
      setTimeout(cb, 500);
    }
  }

  showOne(text) {
    this.stop();
    this._fadeIn(text);
  }

  stop() {
    this._running = false;
    if (this._currentTimeout) clearTimeout(this._currentTimeout);
    this._queue = [];
  }

  clear() {
    this.stop();
    this._fadeOut(() => {});
  }
}
