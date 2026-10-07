// Guarda os arquivos do app para funcionar sem internet.
// Ao mudar algum arquivo, aumente a versão para o celular baixar de novo.
const CACHE = 'meu-treino-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './storage.js',
  './data/exercicios.js',
  './data/modelos.js',
  './components/corpo.js',
  './components/grafico.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Responde do cache na hora e atualiza o cache em segundo plano.
self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET' || new URL(ev.request.url).origin !== location.origin) return;
  ev.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const salvo = await cache.match(ev.request, { ignoreSearch: true });
      const rede = fetch(ev.request)
        .then((resp) => {
          if (resp.ok) cache.put(ev.request, resp.clone());
          return resp;
        })
        .catch(() => salvo);
      return salvo || rede;
    })
  );
});
