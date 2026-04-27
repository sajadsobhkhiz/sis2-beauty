// SiS2 Beauty — Service Worker
const CACHE = "sis2-v1";
const PRECACHE = ["/", "/manifest.json", "/favicon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Network first for API calls
  if (e.request.url.includes("supabase.co") || e.request.url.includes("localhost:3001")) {
    return;
  }
  // Cache first for assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp.ok && e.request.method === "GET") {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    })).catch(() => caches.match("/"))
  );
});
