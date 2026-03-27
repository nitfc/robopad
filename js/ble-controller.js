/* ============================================================
   BLEController：BLE 通信を 100% このクラスに集約する
   ============================================================ */

/* ========= BLE UUID ========= */
const BLE_SERVICE_UUID       = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_JOYSTICK_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_BUTTON_UUID   = '0000ffe2-0000-1000-8000-00805f9b34fb';
const BLE_CHAR_SLIDER_UUID   = '0000ffe3-0000-1000-8000-00805f9b34fb';

export class BLEController {

  constructor({
    onConnect = ()=>{},
    onDisconnect = ()=>{},
    onDebug = ()=>{},
    onToast = ()=>{}
  } = {}) {

    /* ---------- コールバック（UI へ通知するため） ---------- */
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onDebug = onDebug;
    this.onToast = onToast;

    /* ---------- BLE 状態管理 ---------- */
    this.device = null;
    this.server = null;

    this.charJoystick = null;
    this.charButton = null;
    this.charSlider = null;

    this.connected = false;
  }


  /* ============================================================
     接続 / 切断
     ============================================================ */

  async connect() {
    try {
      /* --- デバイス選択 --- */
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, 
        optionalServices: [BLE_SERVICE_UUID]
      });

      /* --- 切断イベント --- */
      this.device.addEventListener("gattserverdisconnected",
                                   () => this._handleDisconnect());

      /* --- GATT 接続 --- */
      this.server = await this.device.gatt.connect();

      /* --- サービス取得 --- */
      const service = await this.server.getPrimaryService(BLE_SERVICE_UUID);

      /* --- 3つの characteristic を取得 --- */
      this.charJoystick = await service.getCharacteristic(BLE_CHAR_JOYSTICK_UUID);
      this.charButton   = await service.getCharacteristic(BLE_CHAR_BUTTON_UUID);
      this.charSlider   = await service.getCharacteristic(BLE_CHAR_SLIDER_UUID);

      this.connected = true;

      this.onConnect();
      this.onToast("接続されました");
      this.onDebug("BLE 接続完了");

    } catch (e) {
      this.onToast("接続失敗: " + e.message);
      this.onDebug("接続失敗: " + e.message);
    }
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    // handleDisconnect() が呼ばれる
  }

  _handleDisconnect() {
    this.connected = false;
    this.onDisconnect();
    this.onToast("切断されました");
    this.onDebug("BLE 切断");
  }


  /* ============================================================
     送信（UIからは sendJoystick(x,y) だけ呼べばよい）
     ============================================================ */

  async sendJoystick(x, y) {
    if (!this.connected || !this.charJoystick) return;

    try {
      await this.charJoystick.writeValueWithoutResponse(
        new Int8Array([x, y])
      );
      this.onDebug(`JOY X:${x} Y:${y}`);
    } catch(e) {
      this.onDebug("JOY送信失敗: " + e.message);
    }
  }

  async sendButtons(bitState) {
    if (!this.connected || !this.charButton) return;

    try {
      await this.charButton.writeValueWithoutResponse(
        new Uint8Array([bitState])
      );
      this.onDebug("BTN: " + bitState.toString(2).padStart(8, "0"));
    } catch(e) {
      this.onDebug("BTN送信失敗: " + e.message);
    }
  }

  async sendSlider(id, value) {
    if (!this.connected || !this.charSlider) return;

    try {
      await this.charSlider.writeValueWithoutResponse(
        new Int8Array([id, value])
      );
      this.onDebug(`SLIDER${id}: ${value}`);
    } catch(e) {
      this.onDebug("SLIDER送信失敗: " + e.message);
    }
  }
}
