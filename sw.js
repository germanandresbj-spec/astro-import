const CACHE_NAME = "astro-import-v2";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icono.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// FETCH
self.addEventListener("fetch", event => {

  // Solo manejar recursos del mismo dominio
  if (event.request.url.startsWith(self.location.origin)) {

    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch(() => {
          return caches.match("/index.html");
        })
    );

  }

});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});