// ProjectSavvy – service worker.
// Stale-while-revalidate for the page: serve the cached app INSTANTLY, then refresh
// from the network in the background so the next open has the latest. Bump CACHE to
// force old caches out.
var CACHE = "focusflow-v59";
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
    // stale-while-revalidate: serve cache instantly, refresh in the background
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match(e.request).then(function (cached) {
          var net = fetch(e.request).then(function (res) {
            try { c.put(e.request, res.clone()); } catch (x) {}
            return res;
          }).catch(function () { return cached || c.match("./index.html"); });
          // instant from cache if we have it; otherwise wait for the network
          return cached || c.match("./index.html").then(function (h) { return h || net; });
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
