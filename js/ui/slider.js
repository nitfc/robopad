/* ========= スライダー クラス（BLE非依存 / コールバック送信）========= */

export class VerticalSlider {
  /**
   * @param {HTMLElement} rootElement
   * @param {number} sliderId
   * @param {Function} onSendCallback  ← ★ 新規: (id, value) を外部へ通知
   */
  constructor(rootElement, sliderId, onSendCallback) {

    this.root = rootElement;
    this.sliderId = sliderId;

    /* ★ BLE characteristic は保持しない（削除） */
    // this.char = null;

    /* ★ 外部から渡される送信用コールバック */
    this.onSend = onSendCallback;   // ← BLE送信の代わりにこれを呼ぶ

    this.valueEl = this.root.querySelector(".slider-value");
    this.knob = this.root.querySelector(".slider-knob");
    this.marker = this.root.querySelector(".slider-marker");
    this.container = this.root.querySelector(".slider-container");

    this.active = false;
    this.activePointerId = null;
    this.dy = 0;

    // 動作/レンジモード
    this.mode = "reset";       // "reset" or "hold"
    this.rangeMode = "signed"; // signed;-127~127，unsigned:0~255

    // 動的に可動範囲を計算
    this.height = this.container.getBoundingClientRect().height;
    this.knobSize = this.container.getBoundingClientRect().width;
    this.radius = (this.height - this.knobSize) / 2;

    this.addEvents();
    this.updateMarker();
  }

  /* -------- 外部からのモード変更 -------- */
  setModes({ mode, rangeMode }, onSendCallback) {
    if (mode) this.mode = mode;
    if (rangeMode) this.rangeMode = rangeMode;
    if (onSendCallback) this.onSend = onSendCallback;
    this.updateMarker();
  }

  /* -------- Pointer Events -------- */
  addEvents() {
    this.knob.addEventListener("pointerdown", e => this.onDown(e));
  }

  onDown(e) {
    e.preventDefault();

    if (this.active) return;

    this.active = true;
    this.activePointerId = e.pointerId;

    this.knob.setPointerCapture(e.pointerId);

    this.move(e.clientY);

    this.onPointerMove = ev => {
      if (ev.pointerId !== this.activePointerId) return;
      ev.preventDefault();

      this._pendingY = ev.clientY;

      if (!this._rafScheduled) {
        this._rafScheduled = true;
        requestAnimationFrame(() => {
          this.move(this._pendingY);
          this._rafScheduled = false;
        });
      }
    };

    this.onPointerUp = ev => {
      if (ev.pointerId !== this.activePointerId) return;
      this.end(ev);
    };

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerUp);
  }

  /* -------- スライダー移動 -------- */
  move(clientY) {
    const rect = this.container.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;

    let dy = clientY - centerY;
    dy = Math.max(-this.radius, Math.min(this.radius, dy));
    this.dy = dy;

    this.knob.style.transform =
      `translate(-50%, calc(-50% + ${dy}px))`;

    /* ▼ signed / unsigned 切替 */
    let v = 0;

    if (this.rangeMode === "signed") {
      v = Math.round(-(dy / this.radius) * 127);
    } else {
      const normalized = (-dy / this.radius + 1) / 2;
      v = Math.round(normalized * 255);
    }

    this.valueEl.textContent = v;

    /* ▼ ★ BLE送信 → 外部コールバックに置き換え */
    if (this.onSend) this.onSend(this.sliderId, v);
  }

  /* -------- 指を離した時 -------- */
  end() {
    this.active = false;

    try {
      this.knob.releasePointerCapture(this.activePointerId);
    } catch (_) {}

    this.activePointerId = null;

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);

    if (this.mode === "reset") this.returnToZero();
  }

  /* -------- 0点に戻る -------- */
  returnToZero() {
    const startDY = this.dy;
    const startTime = performance.now();
    const duration = 200;

    const easeOutQuad = t => t * (2 - t);

    let targetDY = 0;
    if (this.rangeMode === "unsigned") {
      targetDY = this.radius;
    }

    const animate = () => {
      const t = (performance.now() - startTime) / duration;

      if (t >= 1) {
        this.dy = targetDY;

        this.knob.style.transform =
          `translate(-50%, calc(-50% + ${targetDY}px))`;

        /* ▼ 0をBLEへ送信（コールバック経由） */
        this.valueEl.textContent = 0;
        if (this.onSend) this.onSend(this.sliderId, 0);

        return;
      }

      const e = easeOutQuad(t);
      const dy = startDY + (targetDY - startDY) * e;

      this.knob.style.transform =
        `translate(-50%, calc(-50% + ${dy}px))`;

      requestAnimationFrame(animate);
    };

    animate();
  }

  /* --- モード視認用マーカーの表示切替 --- */
  updateMarker() {
    if (this.mode === "reset") {
      this.marker.classList.remove("on");
    } else {
      this.marker.classList.add("on");
    }
  }
}