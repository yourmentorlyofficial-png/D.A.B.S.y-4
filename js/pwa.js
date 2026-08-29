export function setupPWA() {

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }


  window.addEventListener(
    "load",
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "../sw.js",
            {
              scope: "../"
            }
          );


        console.log(
          "D.A.B.S.y PWA ready:",
          registration.scope
        );

      }

      catch (error) {

        console.error(
          "D.A.B.S.y PWA failed:",
          error
        );

      }

    }
  );

}
