import { BLEController } from "./ble-controller.js";
import { Joystick } from "./ui/joystick.js";
import { ButtonManager } from "./ui/button-manager.js";
import { GameButton } from "./ui/game-button.js";
import { VerticalSlider } from "./ui/slider.js";
import { SliderSettingsManager } from "./ui/slider-setting-manager.js";
import { SettingsUI } from "./ui/settingsUI.js";
import { SettingsStore } from "./SettingsStore.js";
import { AppSettings } from "./AppSettings.js";

/* service workerの登録 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 'service-worker.js' を登録 (index.htmlからの相対パス)
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

/* アプリ設定クラスのインスタンス化 */

const store = new SettingsStore();
const appSettings = new AppSettings(store);

/* UIオブジェクトの取得 */

const connectBtn = document.getElementById("connectBtn");

/* BLEContllorのインスタンス化 */

const ble = new BLEController({
  onConnect: () => connectBtn.textContent = "切断する",
  onDisconnect: () => connectBtn.textContent = "接続する",
  onDebug: msg => setDebug(msg),
  onToast: msg => showToast(msg)
});

connectBtn.addEventListener("click", () => {
  if (ble.connected) ble.disconnect();
  else ble.connect();
});

/* ジョイスティックインスタンス */

const joy = new Joystick(
  document.getElementById("joystickArea"),
  document.getElementById("joystickKnob"),
  document.getElementById("joyX"),
  document.getElementById("joyY"),
  (x, y) => ble.sendJoystick(x, y)   // ★ DI：ここだけで BLE と接続！
);

/* ボタンマネージャー */

const buttonManager = new ButtonManager(ble);

// Buttons
const buttons = [
  { id: "btnA", bit: 0, ind_id: "indA" },
  { id: "btnB", bit: 1, ind_id: "indB" },
  { id: "btnX", bit: 2, ind_id: "indX" },
  { id: "btnY", bit: 3, ind_id: "indY" },
  { id: "btnR1", bit: 4, ind_id: "indR1" },
  { id: "btnR2", bit: 5, ind_id: "indR2" },
  { id: "btnL1", bit: 6, ind_id: "indL1" },
  { id: "btnL2", bit: 7, ind_id: "indL2" }
];

// UIとボタンクラスの紐付け
buttons.forEach(btn => {
  new GameButton(
    document.getElementById(btn.id),
    btn.bit,
    document.getElementById(btn.ind_id),
    buttonManager     // ★ Manager を注入
  );
});

/* スライダーのインスタンス化 */

const sliderObjects = [];

document.querySelectorAll(".slider-block").forEach(block => {
  const id = Number(block.dataset.sliderId);

  const slider = new VerticalSlider(
    block,
    id,
    (sliderId, value) => ble.sendSlider(sliderId, value)   // ← ★ここ
  );

  sliderObjects.push(slider);
});


/* SliderSettingsManager 作成 */
const sliderManager = new SliderSettingsManager(sliderObjects);

// アプリ起動時、保存されている設定を UI に反映
sliderManager.applySettings(appSettings.sliderSettings);

/* SettingsUI 作成 */
const settingsUI = new SettingsUI(
    document.getElementById("open-popup-btn"),
    sliderManager,
    (updatedSettings) => {

        // UIへ反映
        sliderManager.applySettings(updatedSettings);

        // ★ AppSettingsへ反映（ここで updateSlider を呼ぶ）
        for (const id in updatedSettings) {
          appSettings.updateSlider(id, updatedSettings[id]);
          //   ↑ ここで save() が内部で呼ばれ永続化される
        }
        appSettings.save();
      }
);


/* ========= Utility ========= */

function setDebug(msg) {
  document.getElementById("debugLog").textContent = msg;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}