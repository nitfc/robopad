/* ============================================================
   Simple PWA Service Worker for Gamepad App
   Base path: /robopad
============================================================ */

const CACHE_NAME = "robopad-app-v1";

/* キャッシュしたい静的ファイル（/robopad を必ず先頭につける） */
const STATIC_ASSETS = [
  "/robopad/index.html",
  // "/robopad/manifest.json",

  "/robopad/icons/icon-192x192.png",
  "/robopad/icons/icon-512x512.png",

  // JS
  "/robopad/js/AppSettings.js",
  "/robopad/js/ble-controller.js",
  "/robopad/js/main.js",
  "/robopad/js/SettingStore.js",
  "/robopad/js/utility.js",

  "/robopad/js/ui/button-manager.js",
  "/robopad/js/ui/game-button.js",
  "/robopad/js/ui/joystick.js",
  "/robopad/js/ui/settingsUI.js",
  "/robopad/js/ui/slider-setting-manager.js",
  "/robopad/js/ui/slider.js",

  // CSS
  "/robopad/styles.css",

  // SE
  "/robopad/button-click-solid-voiced.mp3"
];

/* --- INSTALL --- */
self.addEventListener("install", event => {
  console.log("[SW] Install");

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
    .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

/* --- ACTIVATE（古いキャッシュを削除） --- */
self.addEventListener("activate", event => {
  console.log("[SW] Activate");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log("[SW] Removing old cache", k);
            return caches.delete(k);
          })
      );
    })
  );
});

/* --- FETCH（オンライン優先、オフラインはキャッシュ） --- */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});