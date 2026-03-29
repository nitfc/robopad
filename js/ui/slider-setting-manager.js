/* ========= ui/sliderSettingsManager.js ========= */

export class SliderSettingsManager {
  constructor(sliderObjects, ble) {
    this.sliders = sliderObjects;   // VerticalSlider の配列
    this.ble = ble;   // BLEController のインスタンス

  }

  applySettings(settings) {
    // settings = { sliderId: { mode, rangeMode }, ... }

    for (const sliderId in settings) {
      const slider = this.sliders.find(s => s.sliderId == sliderId);
      if (!slider) continue;

      slider.setModes(settings[sliderId],
        settings[sliderId].rangeMode === "signed" ?
          (sliderId, value) => this.ble.sendSliderI8(sliderId, value) :
          (sliderId, value) => this.ble.sendSliderU8(sliderId, value)
      );   // VerticalSlider の API を利用
    }
  }

  getCurrentSettings() {
    const out = {};
    this.sliders.forEach(sl => {
      out[sl.sliderId] = { mode: sl.mode, rangeMode: sl.rangeMode };
    });
    return out;
  }
}