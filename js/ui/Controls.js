// js/ui/Controls.js
export class Controls {
  constructor() {
    this._btnPlay  = document.getElementById('btn-play');
    this._btnReset = document.getElementById('btn-reset');
    this._selSpeed = document.getElementById('sel-speed');
    this.playing   = false;
    this.onPlay    = null;
    this.onPause   = null;
    this.onReset   = null;
    this.onSpeedChange = null;
    this._bindEvents();
  }

  _bindEvents() {
    this._btnPlay.addEventListener('click', () => this.togglePlay());
    this._btnReset.addEventListener('click', () => { if (this.onReset) this.onReset(); });
    if (this._selSpeed) {
      this._selSpeed.addEventListener('change', () => {
        const v = parseFloat(this._selSpeed.value);
        if (this.onSpeedChange) this.onSpeedChange(v);
      });
    }
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.code === 'KeyR')  { if (this.onReset) this.onReset(); }
    });
  }

  setSpeed(v) {
    if (this._selSpeed) this._selSpeed.value = String(v);
  }

  togglePlay() {
    this.playing = !this.playing;
    this._btnPlay.textContent = this.playing ? '⏸ Pausa' : '▶ Play';
    if (this.playing  && this.onPlay)  this.onPlay();
    if (!this.playing && this.onPause) this.onPause();
  }

  setPlaying(v) {
    this.playing = v;
    this._btnPlay.textContent = v ? '⏸ Pausa' : '▶ Play';
  }

  setPlayEnabled(v, doneLabel = null) {
    this._btnPlay.disabled = !v;
    if (!v && doneLabel) {
      this._btnPlay.textContent = doneLabel;
    } else if (v) {
      this._btnPlay.textContent = this.playing ? '⏸ Pausa' : '▶ Play';
    }
  }
}
