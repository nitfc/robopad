/* ========= ui/sliderSettingsManager.js ========= */

export class SliderSettingsManager {
  constructor(sliderObjects) {
    this.sliders = sliderObjects;   // VerticalSlider の配列
  }

  applySettings(settings) {
    // settings = { sliderId: { mode, rangeMode }, ... }

    for (const sliderId in settings) {
      const slider = this.sliders.find(s => s.sliderId == sliderId);
      if (!slider) continue;

      slider.setModes(settings[sliderId]);   // VerticalSlider の API を利用
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