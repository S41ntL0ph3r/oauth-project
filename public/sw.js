const CACHE_NAME = 'oauth-project-cache-v1';
const STATIC_CACHE_NAME = 'oauth-project-static-v1';

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/',
  '/sign-in',
  '/dashboard',
  '/profile',
  '/settings',
  '/_next/static/css/app/globals.css',
  '/favicon.ico'
];

// Recursos da API que podem ser cachados
const API_CACHE_PATTERNS = [
  '/api/user/profile'
];

// Cache de imagens (GitHub avatars)
const IMAGE_CACHE_PATTERNS = [
  'https://avatars.githubusercontent.com'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Service Worker: Cachando recursos estáticos');
        return cache.addAll(STATIC_RESOURCES.map(url => new Request(url, {
          cache: 'reload'
        })));
      })
    ]).then(() => {
      console.log('Service Worker: Instalação concluída');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativação concluída');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são GET
  if (request.method !== 'GET') {
    return;
  }

  // Cache de imagens do GitHub
  if (IMAGE_CACHE_PATTERNS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Retornar do cache e atualizar em background
            fetch(request).then(fetchResponse => {
              if (fetchResponse.ok) {
                cache.put(request, fetchResponse.clone());
              }
            }).catch(() => {
              // Ignorar erros de rede em background
            });
            return response;
          }
          
          // Não está no cache, buscar da rede
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Cache de APIs específicas
  if (API_CACHE_PATTERNS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(fetchResponse => {
            if (fetchResponse.ok && fetchResponse.status < 400) {
              // Só cachear respostas bem-sucedidas
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });

          // Estratégia: Cache First com Network Fallback
          if (response) {
            // Atualizar cache em background
            fetchPromise.catch(() => {
              // Ignorar erros de rede quando temos cache
            });
            return response;
          }

          // Não há cache, buscar da rede
          return fetchPromise.catch(() => {
            // Se a rede falhar, retornar resposta offline
            return new Response(
              JSON.stringify({ 
                error: 'Sem conexão com a internet',
                offline: true 
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        });
      })
    );
    return;
  }

  // Cache de recursos estáticos
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Atualizar cache em background para recursos estáticos
            fetch(request).then(fetchResponse => {
              if (fetchResponse.ok) {
                cache.put(request, fetchResponse.clone());
              }
            }).catch(() => {
              // Ignorar erros de rede em background
            });
            return response;
          }

          // Não está no cache, buscar da rede
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => {
            // Para páginas HTML, retornar página offline
            if (request.headers.get('accept')?.includes('text/html')) {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - OAuth Project</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <div class="offline">
                    <h1>Você está offline</h1>
                    <p>Verifique sua conexão com a internet e tente novamente.</p>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            
            return new Response('Offline', { status: 503 });
          });
        });
      })
    );
  }
});

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});
