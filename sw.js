// Guarda os arquivos do app para funcionar sem internet.
// Ao mudar algum arquivo, aumente a versão para o celular baixar de novo.
const CACHE = 'meu-treino-v2';
// Fotos e passo a passo dos exercícios (CDN): guardados conforme você abre, para ver offline depois.
const CACHE_MIDIA = 'meu-treino-midia-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './storage.js',
  './data/exercicios.js',
  './data/base.js',
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
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE && n !== CACHE_MIDIA).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  const url = new URL(ev.request.url);

  // Mídia da CDN: as URLs têm o commit fixo, então nunca mudam — cache primeiro.
  if (url.hostname === 'cdn.jsdelivr.net') {
    ev.respondWith(
      caches.open(CACHE_MIDIA).then(async (cache) => {
        const salvo = await cache.match(ev.request);
        if (salvo) return salvo;
        const resp = await fetch(ev.request);
        if (resp.ok || resp.type === 'opaque') cache.put(ev.request, resp.clone());
        return resp;
      })
    );
    return;
  }

  if (url.origin !== location.origin) return;
  // Arquivos do app: responde do cache na hora e atualiza o cache em segundo plano.
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
