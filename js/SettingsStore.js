/* ========= SettingsStore.js ========= */

export class SettingsStore {
  constructor(key = "robopad_settings") {
    this.key = key;
  }

  save(settingsObj) {
    localStorage.setItem(this.key, JSON.stringify(settingsObj));
  }

  load() {
    const json = localStorage.getItem(this.key);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}