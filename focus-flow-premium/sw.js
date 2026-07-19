// ProjectSavvy – service worker.
// NETWORK-FIRST for the page: always fetch the freshest app so a new deploy shows
// on the very next open; fall back to the cached copy only when offline. Bump CACHE
// to force old caches out.
var CACHE = "focusflow-paid-v24";
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
    // network-first: always try the freshest page so deploys show immediately;
    // fall back to the cached copy only when the network is unavailable.
    e.respondWith(
      fetch(e.request.url, { cache: "no-store" }).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put("./index.html", copy); } catch (x) {} });
        return res;
      }).catch(function () {
        return caches.open(CACHE).then(function (c) {
          return c.match(e.request).then(function (h) { return h || c.match("./index.html"); });
        });
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
