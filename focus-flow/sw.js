// Focus & Flow – offline service worker (GitHub Pages build).
var CACHE="focusflow-v1";
var ASSETS=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));
  }));
  self.clients.claim();
});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(function(hit){
    return hit||fetch(e.request).then(function(res){
      return caches.open(CACHE).then(function(c){try{c.put(e.request,res.clone());}catch(x){}return res;});
    }).catch(function(){return caches.match("./index.html");});
  }));
});
