/* ========= AppSettings.js ========= */

export class AppSettings {
  constructor(store) {
    this.store = store;

    // デフォルト設定
    this.data = {
      sliders: {
        /* sliderId: {mode, rangeMode} */
        1 : { "mode": "reset", "rangeMode": "signed" },
        2 : { "mode": "reset", "rangeMode": "signed" },
        3 : { "mode": "reset", "rangeMode": "signed" },
        4 : { "mode": "reset", "rangeMode": "signed" }
      },
      buttons: {
        /* 例: A, B, X, Y の設定を追加可 */
      },
      joystick: {
        /* 例: deadzone や invertX/invertY の追加も可能 */
      }
    };

    // 保存済み設定があれば読み込む
    this.load();
  }

  /* --- 設定取得 --- */
  get sliderSettings() {
    return this.data.sliders;
  }

  /* --- 設定更新 --- */
  updateSlider(sliderId, { mode, rangeMode }) {
    if (!this.data.sliders[sliderId]) {
      this.data.sliders[sliderId] = {};
    }
    if (mode !== undefined) this.data.sliders[sliderId].mode = mode;
    if (rangeMode !== undefined) this.data.sliders[sliderId].rangeMode = rangeMode;

    // this.save();
  }

  /* --- 永続化 --- */
  save() {
    this.store.save(this.data);
  }

  load() {
    const loaded = this.store.load();
    if (loaded) {
      this.data = loaded;
    }
  }
}