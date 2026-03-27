/* ========= ui/settingsUI.js ========= */

export class SettingsUI {
  constructor(openBtn, manager, onApplyCallback) {
    this.manager = manager;
    openBtn.addEventListener("click", () => this.openPopup());
    this.onApply = onApplyCallback;

    // this.createSettingsButton();
    this.createPopup();
  }

  createPopup() {
    this.backdrop = document.createElement("div");
    this.backdrop.className = "settings-backdrop";
    this.backdrop.style.display = "none";

    this.window = document.createElement("div");
    this.window.className = "settings-window";

    this.backdrop.appendChild(this.window);
    document.body.appendChild(this.backdrop);
  }

  openPopup() {
    this.renderContent();
    this.backdrop.style.display = "flex";
  }

  renderContent() {
    this.window.innerHTML = `
      <div class="settings-title">スライダーの設定</div>

      <div class="settings-sliders-row">
        ${this.manager.sliders.map(sl => `
          <div class="settings-slider-card sldr${sl.sliderId + 1}">
            <div class="settings-slider-title">スライダー ${sl.sliderId + 1}</div>
            ${this.createOptionButtons(sl)}
          </div>
        `).join("")}
      </div>

      <div class="settings-btn-row">
        <button class="settings-btn" id="closeSettingsBtn">キャンセル</button>
        <button class="settings-btn settings-btn-primary" id="applySettingsBtn">適　用</button>
      </div>
    `;

    this.attachOptionHandlers();

    document.getElementById("applySettingsBtn").onclick = () => this.apply();
    document.getElementById("closeSettingsBtn").onclick = () => this.close();
  }

  createOptionButtons(slider) {
    return `
      <div class="settings-section-label">モード</div>
      <div class="settings-option-row" data-slider="${slider.sliderId}" data-type="return">
        <div class="settings-option-btn ${slider.mode === "reset" ? "selected":""}" data-value="reset">
          リセット
        </div>
        <div class="settings-option-btn ${slider.mode === "hold" ? "selected":""}" data-value="hold">
          ホールド
        </div>
      </div>

      <div class="settings-section-label">レンジ</div>
      <div class="settings-option-row" data-slider="${slider.sliderId}" data-type="range">
        <div class="settings-option-btn ${slider.rangeMode === "signed" ? "selected":""}" data-value="signed">
          -127〜127
        </div>
        <div class="settings-option-btn ${slider.rangeMode === "unsigned" ? "selected":""}" data-value="unsigned">
          0〜255
        </div>
      </div>
    `;
  }

  apply() {
    const settings = {};

    this.manager.sliders.forEach(sl => {
      const modeSel = this.window.querySelector(
        `.settings-option-row[data-slider="${sl.sliderId}"][data-type="return"] .settings-option-btn.selected`
      ).dataset.value;

      const rangeSel = this.window.querySelector(
        `.settings-option-row[data-slider="${sl.sliderId}"][data-type="range"] .settings-option-btn.selected`
      ).dataset.value;

      settings[sl.sliderId] = { mode: modeSel, rangeMode: rangeSel };
    });

    // this.manager.applySettings(settings);
    
    // ★ main.js に通知（ここが updateSlider 呼び出しへの入り口）
    if (this.onApply) this.onApply(settings);

    this.close();
  }

  close() {
    this.backdrop.style.display = "none";
  }

  attachOptionHandlers() {
    this.window.querySelectorAll(".settings-option-row .settings-option-btn")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          const row = btn.parentElement;

          row.querySelectorAll(".settings-option-btn")
             .forEach(b => b.classList.remove("selected"));

          btn.classList.add("selected");
        });
      });
  }
}