console.log("DABSy booting...");

window.addEventListener("DOMContentLoaded", () => {

  const world =
    document.getElementById("dabsyWorld");

  const face =
    document.getElementById("dabsyFace");

  const status =
    document.getElementById("status");

  const speech =
    document.getElementById("speech");

  if (!world || !face) {

    document.body.innerHTML = `
      <div style="
        background:#000;
        color:white;
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        font-family:system-ui;
        padding:30px;
      ">
        D.A.B.S.y couldn't find its face.<br>
        HTML loaded, but something is wrong.
      </div>
    `;

    return;
  }

  status.textContent = "DABSy Online";
  speech.textContent = "Hello! I'm alive. 🤖💙";

  let timer = null;

  world.addEventListener("pointerdown", () => {

    clearTimeout(timer);

    face.classList.add("surprised");

    status.textContent = "Listening";
    speech.textContent = "I'm listening... 👂";

    timer = setTimeout(() => {

      if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const voice =
          new SpeechSynthesisUtterance(
            "Hi! I'm DABSy. What can I help you with?"
          );

        voice.lang = "en-IN";
        voice.pitch = 1.15;
        voice.rate = 0.98;

        speechSynthesis.speak(voice);
      }

    }, 350);

  });

  world.addEventListener("pointerup", () => {

    clearTimeout(timer);

    face.classList.remove("surprised");

    status.textContent = "DABSy";
    speech.textContent = "Yep! I felt that. ✨";

  });

  world.addEventListener("pointercancel", () => {

    clearTimeout(timer);

    face.classList.remove("surprised");

  });

  world.addEventListener("dblclick", () => {

    status.textContent = "DABSy";
    speech.textContent =
      "Double tap detected! ✨";

  });

  setInterval(() => {

    if (
      !face.classList.contains("surprised")
    ) {

      face.classList.add("blink");

      setTimeout(() => {
        face.classList.remove("blink");
      }, 150);

    }

  }, 3500);

});
