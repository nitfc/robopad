const BUTTON_BINDINGS = {
  KeyJ: "btnA",
  KeyK: "btnB",
  KeyU: "btnX",
  KeyI: "btnY",
  KeyQ: "btnL1",
  KeyE: "btnR1",
  KeyZ: "btnL2",
  KeyC: "btnR2"
};

export class KeyboardControls {
  constructor({ buttons, sliders }) {
    this.buttons = new Map(buttons.map(button => [button.el.id, button]));
    this.sliders = sliders;
    this.selectedSliderIndex = 0;
    this.sliderStepMs = 30;
    this.sliderStepTimer = null;
    this.sliderKeys = {
      ArrowUp: false,
      ArrowDown: false
    };

    this.listen();
  }

  listen() {
    window.addEventListener("keydown", e => this.onKey(e, true));
    window.addEventListener("keyup", e => this.onKey(e, false));
    window.addEventListener("blur", () => this.releaseAll());
  }

  onKey(e, pressed) {
    if (this.isEditableTarget(e.target)) return;

    if (this.handleButtonKey(e, pressed)) return;
    if (this.handleSliderSelectKey(e, pressed)) return;
    if (this.handleSliderMoveKey(e, pressed)) return;
  }

  handleButtonKey(e, pressed) {
    const buttonId = BUTTON_BINDINGS[e.code];
    if (!buttonId) return false;

    e.preventDefault();

    const button = this.buttons.get(buttonId);
    if (!button) return true;

    if (pressed) {
      if (!e.repeat) button.press(`key:${e.code}`);
    } else {
      button.release(`key:${e.code}`);
    }

    return true;
  }

  handleSliderSelectKey(e, pressed) {
    if (!pressed) return false;
    if (!/^Digit[1-4]$/.test(e.code)) return false;

    const index = Number(e.code.slice(-1)) - 1;
    if (!this.sliders[index]) return true;

    e.preventDefault();
    this.selectedSliderIndex = index;
    this.updateSelectedSlider();
    return true;
  }

  handleSliderMoveKey(e, pressed) {
    if (!(e.code in this.sliderKeys)) return false;

    e.preventDefault();

    if (this.sliderKeys[e.code] === pressed) return true;

    this.sliderKeys[e.code] = pressed;
    this.updateSelectedSlider();
    return true;
  }

  updateSelectedSlider() {
    const slider = this.sliders[this.selectedSliderIndex];
    if (!slider) return;

    this.stopSliderStepTimer();

    const up = this.sliderKeys.ArrowUp;
    const down = this.sliderKeys.ArrowDown;

    if (slider.mode === "hold") {
      if (up && down) return;
      if (up || down) {
        const direction = up ? 1 : -1;
        this.stepSlider(slider, direction);
        this.sliderStepTimer = setInterval(() => {
          this.stepSlider(slider, direction);
        }, this.sliderStepMs);
      }
      return;
    }

    if (up && down) {
      slider.setValue(0);
      return;
    }

    if (up) {
      slider.setValue(slider.rangeMode === "unsigned" ? 255 : 127);
      return;
    }

    if (down) {
      slider.setValue(slider.rangeMode === "unsigned" ? 0 : -127);
      return;
    }

    slider.resetFromKeyboard();
  }

  stepSlider(slider, direction) {
    const min = slider.rangeMode === "unsigned" ? 0 : -127;
    const max = slider.rangeMode === "unsigned" ? 255 : 127;
    const current = Number(slider.valueEl.textContent) || 0;
    const next = Math.max(min, Math.min(max, current + direction));

    slider.setValue(next);
  }

  stopSliderStepTimer() {
    if (!this.sliderStepTimer) return;

    clearInterval(this.sliderStepTimer);
    this.sliderStepTimer = null;
  }

  releaseAll() {
    for (const [code, buttonId] of Object.entries(BUTTON_BINDINGS)) {
      const button = this.buttons.get(buttonId);
      if (button) button.release(`key:${code}`);
    }

    this.sliderKeys.ArrowUp = false;
    this.sliderKeys.ArrowDown = false;
    this.stopSliderStepTimer();
    this.updateSelectedSlider();
  }

  isEditableTarget(target) {
    if (!target) return false;

    const tagName = target.tagName;
    return target.isContentEditable ||
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT";
  }
}
