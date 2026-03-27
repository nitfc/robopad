 export class ButtonManager {
  constructor(ble) {
    this.ble = ble;
    this.state = 0;   // ボタン8個 → 1byte
  }

  press(bit) {
    this.state |= (1 << bit);
    this.ble.sendButtons(this.state);
  }

  release(bit) {
    this.state &= ~(1 << bit);
    this.ble.sendButtons(this.state);
  }
}
