// Service Worker temporariamente desabilitado para debug
console.log('Service Worker: Desabilitado temporariamente');

self.addEventListener('install', () => {
  console.log('Service Worker: Instalação pulada');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Limpando todos os caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', () => {
  // Não interferir nas requisições
  return;
});
