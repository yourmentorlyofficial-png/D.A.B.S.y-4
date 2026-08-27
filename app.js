"use strict";

window.addEventListener("DOMContentLoaded", () => {

  document.body.style.background = "#000";

  const face = document.getElementById("dabsyFace");
  const eyes = document.querySelectorAll(".eye");

  console.log("DABSy diagnostic started");
  console.log("Face:", face);
  console.log("Eyes:", eyes.length);

  if (!face) {
    document.body.innerHTML =
      '<div style="color:red;font-size:24px;padding:30px">DABSy ERROR: dabsyFace missing</div>';
    return;
  }

  face.style.display = "flex";
  face.style.position = "absolute";
  face.style.left = "50%";
  face.style.top = "50%";
  face.style.transform = "translate(-50%,-50%)";
  face.style.zIndex = "9999";

  eyes.forEach(eye => {

    eye.style.display = "block";
    eye.style.visibility = "visible";
    eye.style.opacity = "1";
    eye.style.width = "100px";
    eye.style.height = "140px";
    eye.style.background = "white";
    eye.style.borderRadius = "40px";
    eye.style.boxShadow = "0 0 40px white";

  });

});
