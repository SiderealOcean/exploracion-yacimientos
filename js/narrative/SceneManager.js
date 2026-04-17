// js/narrative/SceneManager.js
export class SceneManager {
  constructor(scenes = []) {
    this.scenes = scenes;
    this.currentIndex = 0;
    this._state = {};
  }

  get current() { return this.scenes[this.currentIndex]; }
  get total() { return this.scenes.length; }

  setState(s) { this._state = s; }
  getState() { return this._state; }

  goto(index) {
    if (index < 0 || index >= this.scenes.length) return false;
    if (this.current) this.current.exit(this._state);
    this.currentIndex = index;
    this.current.enter(this._state);
    return true;
  }

  next() { return this.goto(this.currentIndex + 1); }
  prev() { return this.goto(this.currentIndex - 1); }

  update(dt) {
    if (this.current) this.current.update(dt, this._state);
  }
}
