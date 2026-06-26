export class GameButton {
  constructor(el, bit, indicator, manager) {
    this.el = el;
    this.bit = bit;
    this.manager = manager;
    this.indicator = indicator;
    this.activePointer = null;
    this.pressSources = new Set();

    this.soundEl = document.getElementById("btnClickSound");

    this.addEvents();
  }

  addEvents() {
    this.el.addEventListener("pointerdown", e => this.onDown(e));
    this.el.addEventListener("pointerup", e => this.onUp(e));
    this.el.addEventListener("pointercancel", e => this.onUp(e));
    this.el.addEventListener("pointerleave", e => this.onUp(e));
  }

  onDown(e) {
    if (this.activePointer !== null) return;

    this.activePointer = e.pointerId;
    this.el.setPointerCapture(e.pointerId);
    this.press("pointer");
  }

  onUp(e) {
    if (e.pointerId !== this.activePointer) return;

    this.activePointer = null;
    this.release("pointer");
  }

  press(source = "keyboard") {
    const wasReleased = this.pressSources.size === 0;
    this.pressSources.add(source);

    if (!wasReleased) return;

    this.el.classList.add("pressed");
    this.indicator.classList.add("on");
    this.manager.press(this.bit);
    this.playClickSound();
  }

  release(source = "keyboard") {
    this.pressSources.delete(source);

    if (this.pressSources.size > 0) return;

    this.el.classList.remove("pressed");
    this.indicator.classList.remove("on");
    this.manager.release(this.bit);
  }

  playClickSound() {
    if (!this.soundEl) return;

    const snd = this.soundEl.cloneNode(true);
    snd.volume = 0.5;
    snd.play().catch(() => {});
  }
}
