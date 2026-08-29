import {
  setState
} from "./state.js";

import {
  setupSpeech
} from "./speech.js";

import {
  setupInteraction
} from "./interaction.js";

import {
  startFaceLife
} from "./face.js";

import {
  setupMenu
} from "./menu.js";

import {
  setupStudy
} from "./study.js";

import {
  setupPWA
} from "./pwa.js";


function boot() {

  console.log(
    "D.A.B.S.y booting..."
  );


  setState(
    "DABSy Online",
    "Hello! I'm DABSy. 💙"
  );


  setupStudy();

  setupSpeech();

  setupInteraction();

  setupMenu();

  startFaceLife();

  setupPWA();


  console.log(
    "D.A.B.S.y online."
  );

}


if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    boot
  );

}

else {

  boot();

}
