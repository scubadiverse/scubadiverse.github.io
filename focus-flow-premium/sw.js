// ProjectSavvy – service worker.
// NETWORK-FIRST for the page: always fetch the freshest app so a new deploy shows
// on the very next open; fall back to the cached copy only when offline. Bump CACHE
// to force old caches out.
var CACHE = "focusflow-paid-v28";
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
    // FAST open + fresh: serve the cached page almost instantly, but race a fresh
    // network fetch for up to 1.5s so a quick connection still shows the latest,
    // and the cache is refreshed in the background for the next open either way.
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match("./index.html").then(function (cached) {
          var net = fetch(e.request.url, { cache: "no-store" }).then(function (res) {
            try { c.put("./index.html", res.clone()); } catch (x) {}
            return res;
          });
          if (!cached) return net; // nothing cached yet: must wait for the network
          return Promise.race([
            net.catch(function () { return cached; }),
            new Promise(function (resolve) { setTimeout(function () { resolve(cached); }, 1500); })
          ]);
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
