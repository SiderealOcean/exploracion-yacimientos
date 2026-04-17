// js/ui/Controls.js
export class Controls {
  constructor() {
    this._btnPlay  = document.getElementById('btn-play');
    this._btnStep  = document.getElementById('btn-step');
    this._btnReset = document.getElementById('btn-reset');
    this._selSpeed = document.getElementById('sel-speed');
    this.playing   = false;
    this.speed     = 1;
    this.onPlay    = null;
    this.onPause   = null;
    this.onStep    = null;
    this.onReset   = null;
    this.onSpeed   = null;
    this._bindEvents();
  }

  _bindEvents() {
    this._btnPlay.addEventListener('click', () => this.togglePlay());
    this._btnStep.addEventListener('click', () => { if (this.onStep) this.onStep(); });
    this._btnReset.addEventListener('click', () => { if (this.onReset) this.onReset(); });
    this._selSpeed.addEventListener('change', () => {
      this.speed = parseFloat(this._selSpeed.value);
      if (this.onSpeed) this.onSpeed(this.speed);
    });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.code === 'KeyS')  { if (this.onStep) this.onStep(); }
      if (e.code === 'KeyR')  { if (this.onReset) this.onReset(); }
    });
  }

  togglePlay() {
    this.playing = !this.playing;
    this._btnPlay.textContent = this.playing ? '⏸ Pause' : '▶ Play';
    if (this.playing && this.onPlay) this.onPlay();
    if (!this.playing && this.onPause) this.onPause();
  }

  setPlaying(v) {
    this.playing = v;
    this._btnPlay.textContent = v ? '⏸ Pause' : '▶ Play';
  }
}
