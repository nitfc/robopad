/* ========= KeyboardJoystick: WASD キーでジョイスティックを操作 ========= */

export class KeyboardJoystick {
  /**
   * @param {HTMLElement} knobEl       ジョイスティックのノブ要素
   * @param {HTMLElement} xOutEl       X値の表示要素
   * @param {HTMLElement} yOutEl       Y値の表示要素
   * @param {number}      radius       ノブの可動半径 (px)
   * @param {Function}    onMoveCallback  (x, y) を外部へ通知
   */
  constructor(knobEl, xOutEl, yOutEl, radius, onMoveCallback) {
    this.knob = knobEl;
    this.xOutEl = xOutEl;
    this.yOutEl = yOutEl;
    this.radius = radius;
    this.onMove = onMoveCallback;

    // 現在押されているキーの状態
    this.keys = { w: false, a: false, s: false, d: false };

    // 現在の出力値
    this.currentX = 0;
    this.currentY = 0;

    this._listen();
  }

  /* -------- イベント登録 -------- */
  _listen() {
    window.addEventListener("keydown", e => this._onKey(e, true));
    window.addEventListener("keyup",   e => this._onKey(e, false));
  }

  _onKey(e, pressed) {
    const key = e.key.toLowerCase();
    if (!(key in this.keys)) return;

    // 同じ状態なら何もしない（キーリピート対策）
    if (this.keys[key] === pressed) return;

    this.keys[key] = pressed;
    this._update();
  }

  /* -------- 値の算出と反映 -------- */
  _update() {
    // X軸（旋回）: D=右旋回(+127), A=左旋回(-127)
    let x = 0;
    if (this.keys.d) x += 127;
    if (this.keys.a) x -= 127;

    // Y軸（前後）: W=前進(+127), S=後退(-127)
    let y = 0;
    if (this.keys.w) y += 127;
    if (this.keys.s) y -= 127;

    // 斜め入力時にノルムを 127 に制限
    if (x !== 0 && y !== 0) {
      const scale = 127 / Math.sqrt(x * x + y * y);
      x = Math.round(x * scale);
      y = Math.round(y * scale);
    }

    this.currentX = x;
    this.currentY = y;

    // ノブの表示位置（画面上は Y が反転: 上=マイナス px）
    const pxX =  (x / 127) * this.radius;
    const pxY = -(y / 127) * this.radius;

    this.knob.style.transform =
      `translate(calc(-50% + ${pxX}px), calc(-50% + ${pxY}px))`;

    // ラベル更新
    this.xOutEl.textContent = x;
    this.yOutEl.textContent = y;

    // BLE送信
    if (this.onMove) this.onMove(x, y);
  }
}
