/* Service worker de l'appli « Évaluation atelier » : fonctionne sans Internet après la 1re ouverture.
   Les fichiers sont servis depuis la tablette, puis mis à jour en arrière-plan quand Internet est là. */
const VERSION = 'evaluation-atelier-f95fb4e29b';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png', './icone-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const reseau = caches.open(VERSION).then(c => fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; })).catch(() => null);
  e.waitUntil(reseau.then(() => { }));
  e.respondWith(caches.open(VERSION).then(async c => (await c.match(req, { ignoreSearch: true })) || (await reseau) || c.match('./index.html')));
});
