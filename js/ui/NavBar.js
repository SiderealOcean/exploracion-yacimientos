// js/ui/NavBar.js
export class NavBar {
  constructor() {
    this._btnPrev = document.getElementById('btn-prev');
    this._btnNext = document.getElementById('btn-next');
    this.onPrev   = null;
    this.onNext   = null;
    this._bindEvents();
  }

  _bindEvents() {
    this._btnPrev.addEventListener('click', () => { if (this.onPrev) this.onPrev(); });
    this._btnNext.addEventListener('click', () => { if (this.onNext) this.onNext(); });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'ArrowRight') { if (this.onNext) this.onNext(); }
      if (e.code === 'ArrowLeft')  { if (this.onPrev) this.onPrev(); }
    });
  }

  update(currentIndex, total) {
    this._btnPrev.disabled = currentIndex === 0;
    this._btnNext.disabled = currentIndex === total - 1;
  }
}
