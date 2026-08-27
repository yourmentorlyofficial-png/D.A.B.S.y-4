window.addEventListener("load", function () {

  const world = document.getElementById("dabsyWorld");
  const face = document.getElementById("dabsyFace");
  const speech = document.getElementById("speech");
  const status = document.getElementById("status");

  if (!world || !face) {
    document.body.innerHTML =
      "<div style='color:white;background:black;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:30px'>" +
      "D.A.B.S.y could not find its face.<br><br>HTML is loading, but the face IDs don't match." +
      "</div>";

    return;
  }

  status.textContent = "DABSy";
  speech.textContent = "I'm alive. Tap me!";

  let timer = null;

  world.addEventListener("pointerdown", function () {

    clearTimeout(timer);

    timer = setTimeout(function () {

      status.textContent = "Listening";
      speech.textContent = "I'm listening... 👂";

      face.classList.add("surprised");

    }, 300);

  });

  world.addEventListener("pointerup", function () {

    clearTimeout(timer);

    status.textContent = "DABSy";
    speech.textContent = "Yep! I felt that. 🤖";

    face.classList.remove("surprised");

  });

  world.addEventListener("pointercancel", function () {

    clearTimeout(timer);

  });

  world.addEventListener("dblclick", function () {

    status.textContent = "DABSy";
    speech.textContent = "Double tap detected! ✨";

  });

});
