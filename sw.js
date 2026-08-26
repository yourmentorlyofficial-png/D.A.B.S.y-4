const CACHE_NAME = "dabsy-v4-final";

const APP_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  /*
    Gemini/API requests must NEVER be cached.
  */
  if (
    request.url.includes("generativelanguage.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {

            if (
              response &&
              response.status === 200 &&
              request.method === "GET" &&
              new URL(request.url).origin === location.origin
            ) {
              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, copy);
                });
            }

            return response;
          })
          .catch(() => {
            return caches.match("./index.html");
          });
      })
  );
});
