// Focus & Flow – service worker.
// Network-first for the page so you always get the newest version when online,
// cache as offline fallback. Bump CACHE to force old caches out.
var CACHE = "focusflow-v38";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

// Page can ask a waiting worker to take over right away.
self.addEventListener("message", function (e) {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var isPage = e.request.mode === "navigate" ||
    (e.request.destination === "document") ||
    e.request.url.indexOf("index.html") !== -1;
  if (isPage) {
    // network-first: newest page when online, cache when offline
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(e.request, copy); } catch (x) {} });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (h) { return h || caches.match("./index.html"); });
      })
    );
  } else {
    // cache-first for icons/manifest
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { try { c.put(e.request, copy); } catch (x) {} });
          return res;
        });
      })
    );
  }
});
