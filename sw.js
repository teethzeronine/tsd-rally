const CACHE = "tsd-rally-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/og-image.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Sinkron jam induk (API luar) tidak boleh dicache atau dicegat
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => {
      const net = fetch(req).then(r => {
        if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return r;
      }).catch(() => hit || caches.match("./index.html"));
      return hit || net;
    })
  );
});
