const CACHE_NAME = "dabsy-v5";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-512×512.png"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())

  );

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {

  const request = event.request;

  /*
    Never interfere with Gemini/API requests.
  */

  if (
    request.url.includes(
      "generativelanguage.googleapis.com"
    )
  ) {
    return;
  }


  /*
    Only handle GET requests.
  */

  if (request.method !== "GET") {
    return;
  }


  event.respondWith(

    fetch(request)
      .then(response => {

        /*
          Save successful same-origin
          files into the cache.
        */

        if (
          response &&
          response.status === 200 &&
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

        /*
          Offline fallback.
        */

        return caches.match(request)
          .then(cached => {

            if (cached) {
              return cached;
            }

            return caches.match("./index.html");

          });

      })

  );

});
