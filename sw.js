const CACHE_NAME = "dabsy-rescue-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
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

  if (request.method !== "GET") {
    return;
  }

  if (
    request.url.includes(
      "generativelanguage.googleapis.com"
    )
  ) {
    return;
  }

  /*
    For the actual app files:
    get the newest version from GitHub/server first.
  */

  const url = new URL(request.url);

  const isAppFile =
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("styles.css") ||
    url.pathname.endsWith("app.js") ||
    url.pathname.endsWith("manifest.json");

  if (isAppFile) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (
            response &&
            response.status === 200
          ) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, copy);
              });
          }

          return response;
        })
        .catch(() =>
          caches.match(request)
        )
    );

    return;
  }

  /*
    Other files:
    cache first, then network.
  */

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
              url.origin === location.origin
            ) {
              const copy =
                response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(
                    request,
                    copy
                  );
                });
            }

            return response;
          });
      })
      .catch(() =>
        caches.match("./index.html")
      )
  );
});
