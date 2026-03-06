const CACHE_NAME = "astro-import-v3";

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

  if (event.request.method !== "GET") return;

  if (event.request.url.startsWith(self.location.origin)) {

    event.respondWith(
      caches.match(event.request)
        .then(response => {

          if (response) return response;

          return fetch(event.request)
            .then(fetchResponse => {

              if (!fetchResponse || fetchResponse.status !== 200) {
                return fetchResponse;
              }

              const responseClone = fetchResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));

              return fetchResponse;
            });

        })
        .catch(() => {
          return caches.match("/index.html")
            .then(res => res || new Response("Offline", { status: 503 }));
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