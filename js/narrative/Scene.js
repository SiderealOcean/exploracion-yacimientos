// js/narrative/Scene.js
export class Scene {
  constructor(name) {
    this.name   = name;
    this._slides   = [];
    this._slideIdx = 0;
  }

  // Subclass calls this in enter() to define the slide deck
  _setupSlides(slides) {
    this._slides   = slides;
    this._slideIdx = 0;
  }

  // Show slide at index. triggerEnter=false when navigating backwards.
  _gotoSlide(idx, triggerEnter = true) {
    if (idx < 0 || idx >= this._slides.length) return;
    const prev = this._slides[this._slideIdx];
    if (prev && prev.onExit) prev.onExit();
    this._slideIdx = idx;
    const slide = this._slides[idx];
    if (slide.lines && this.subtitle) this.subtitle.show(slide.lines);
    if (this.sidePanel?.setSlideDots) {
      this.sidePanel.setSlideDots(idx, this._slides.length);
    }
    if (this.controls) {
      const enabled = typeof slide.playEnabled === 'function'
        ? slide.playEnabled()
        : (slide.playEnabled ?? false);
      this.controls.setPlayEnabled(enabled);
      if (!enabled) {
        this.controls.setPlaying(false);
        if ('_running' in this) this._running = false;
      }
    }
    if (triggerEnter && slide.onEnter) slide.onEnter();
  }

  // Returns true if advanced within scene, false if already at last slide
  nextSlide() {
    if (this._slideIdx < this._slides.length - 1) {
      this._gotoSlide(this._slideIdx + 1, true);
      return true;
    }
    return false;
  }

  // Returns true if retreated within scene, false if already at first slide
  prevSlide() {
    if (this._slideIdx > 0) {
      this._gotoSlide(this._slideIdx - 1, false); // no side effects going back
      return true;
    }
    return false;
  }

  enter(state)       {}
  update(dt, state)  {}
  exit(state)        {}
}
