/* ============================================================
   utility.js
   汎用的なユーティリティ関数をまとめたモジュール
   ============================================================ */

/* ----------------------------
   値を範囲内に収める
 ---------------------------- */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ----------------------------
   値を別レンジに射影する
   (ex: -radius..radius → 0..255)
 ---------------------------- */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/* ----------------------------
   2点間距離
 ---------------------------- */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ----------------------------
   要素の中心座標を取得
 ---------------------------- */
export function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/* ----------------------------
   easing：easeOutQuad
 ---------------------------- */
export function easeOutQuad(t) {
  return t * (2 - t);
}

/* ----------------------------
   requestAnimationFrame による throttle
   Android Chrome の pointermove 最適化に使用
 ---------------------------- */
export function rafThrottle(callback) {
  let scheduled = false;
  let lastArgs = null;

  return function (...args) {
    lastArgs = args;
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        callback(...lastArgs);
        scheduled = false;
      });
    }
  };
}