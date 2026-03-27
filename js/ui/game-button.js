/* ========= 各ボタン ========= */

export class GameButton {
  constructor(el, bit, indicator, manager) {
    this.el = el;
    this.bit = bit;
    this.manager = manager;
    this.indicator = indicator;
    this.activePointer = null;    // ← このボタンを押している指のID

    // 効果音の要素
    this.soundEl = document.getElementById("btnClickSound");

    this.addEvents();
  }

  addEvents() {
    this.el.addEventListener("pointerdown", (e) => this.onDown(e));
    this.el.addEventListener("pointerup", (e) => this.onUp(e));
    this.el.addEventListener("pointercancel", (e) => this.onUp(e));
    this.el.addEventListener("pointerleave", (e) => this.onUp(e));
  }

  onDown(e) {
    // すでに別の指が押している場合は無視
    if (this.activePointer !== null) return;

    this.activePointer = e.pointerId;

    // このボタンに pointer capture を設定（指が外へ出ても追跡できる）
    this.el.setPointerCapture(e.pointerId);

    this.el.classList.add("pressed");
    this.indicator.classList.add("on");

    this.manager.press(this.bit);

    this.playClickSound();
  }

  onUp(e) {
    // 自分が管理する pointerId でなければ無視
    if (e.pointerId !== this.activePointer) return;

    this.activePointer = null;

    this.el.classList.remove("pressed");
    this.indicator.classList.remove("on");

    this.manager.release(this.bit);
  }

  playClickSound() {
    if (!this.soundEl) return;

    // ▼ 同時に複数再生できるように clone して再生
    const snd = this.soundEl.cloneNode(true);
    snd.volume = 0.5;      // 音量調整（0〜1）
    snd.play().catch(()=>{});
  }

}