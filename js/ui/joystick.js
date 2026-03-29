import { clamp, distance, rafThrottle, getCenter } from "../utility.js";

/* ========= 改良版 Joystick（BLE非依存 / コールバック注入） ========= */

export class Joystick {
  /**
   * @param {HTMLElement} areaEl   … ジョイスティックエリア
   * @param {HTMLElement} knobEl   … ノブ
   * @param {HTMLElement} xOutEl   … X 値出力
   * @param {HTMLElement} yOutEl   … Y 値出力
   * @param {Function} onMoveCallback  … (x, y) を外部へ通知する関数 ← ★新規
   */
  constructor(areaEl, knobEl, xOutEl, yOutEl, onMoveCallback) {

    this.area = areaEl;
    this.knob = knobEl;
    this.xOutEl = xOutEl;
    this.yOutEl = yOutEl;

    /* ★ 外部から渡されたコールバックを記録 */
    this.onMoveCallback = onMoveCallback;  // ← ここが BLE 代わり

    this.active = false;
    this.activePointerId = null;

    this.knobDX = 0;
    this.knobDY = 0;

    this.radius = 52;  

    this._rafScheduled = false;
    this._pendingX = 0;
    this._pendingY = 0;

    this.addEvents();
  }

  /* ---------------- Pointer Events ---------------- */
  addEvents() {
    this.area.addEventListener("pointerdown", e => this.onDown(e));
  }

  onDown(e) {
    e.preventDefault();

    if (this.active) return;

    this.active = true;
    this.activePointerId = e.pointerId;

    const center = getCenter(this.area);
    this.origin = { x: center.x, y: center.y };

    this.area.setPointerCapture(e.pointerId);

    this.move(e.clientX, e.clientY);

    /* ★ Android Chrome 最適化用 rAF move */
    this.onPointerMove = ev => {
      if (ev.pointerId !== this.activePointerId) return;

      ev.preventDefault();

      this._pendingX = ev.clientX;
      this._pendingY = ev.clientY;

      if (!this._rafScheduled) {
        this._rafScheduled = true;
        requestAnimationFrame(() => {
          this.move(this._pendingX, this._pendingY);
          this._rafScheduled = false;
        });
      }
    };

    this.onPointerUp = ev => {
      if (ev.pointerId !== this.activePointerId) return;
      this.end();
    };

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerUp);
  }

  /* ---------------- Joystick Movement ---------------- */
  move(cx, cy) {
    let dx = cx - this.origin.x;
    let dy = cy - this.origin.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.radius) {
      dx = dx / dist * this.radius;
      dy = dy / dist * this.radius;
    }

    this.knobDX = dx;
    this.knobDY = dy;

    this.knob.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    const joyX = Math.round(dx / this.radius * 127);
    const joyY = - Math.round(dy / this.radius * 127);

    this.xOutEl.textContent = joyX;
    this.yOutEl.textContent = joyY;

    /* ★ send → 外部コールバックに置き換え */
    if (this.onMoveCallback) {
      this.onMoveCallback(joyX, joyY);
    }
  }

  /* ---------------- Joystick End (Return to Center) ---------------- */
  end() {
    this.active = false;

    try {
      this.area.releasePointerCapture(this.activePointerId);
    } catch (_) {}

    this.activePointerId = null;

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);

    this.returnCenter();
  }

  returnCenter() {
    const startDX = this.knobDX;
    const startDY = this.knobDY;
    const startTime = performance.now();
    const duration = 200;

    const easeOutQuad = t => t * (2 - t);

    const animate = () => {
      const t = (performance.now() - startTime) / duration;

      if (t >= 1) {
        this.knob.style.transform = `translate(-50%, -50%)`;

        this.xOutEl.textContent = 0;
        this.yOutEl.textContent = 0;

        /* ★ BLE送信 → コールバックへ */
        if (this.onMoveCallback) this.onMoveCallback(0, 0);

        return;
      }

      const e = easeOutQuad(t);

      const dx = startDX * (1 - e);
      const dy = startDY * (1 - e);

      this.knob.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      const joyX = Math.round(dx / this.radius * 127);
      const joyY = - Math.round(dy / this.radius * 127);

      this.xOutEl.textContent = joyX;
      this.yOutEl.textContent = joyY;

      /* ★ ここも外部へ通知 */
      if (this.onMoveCallback) this.onMoveCallback(joyX, joyY);

      requestAnimationFrame(animate);
    };

    animate();
  }

  /* ---------------- Utility ---------------- */
  /*
  getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
*/
}