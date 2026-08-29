import { state } from "./state.js";


const face =
  document.getElementById("dabsyFace");


export function addFaceClass(name) {

  if (!face) return;

  face.classList.add(name);

}


export function removeFaceClass(name) {

  if (!face) return;

  face.classList.remove(name);

}


export function blink() {

  if (!face) return;

  face.classList.add("blink");

  setTimeout(() => {

    face.classList.remove("blink");

  }, 150);

}


export function look(direction) {

  if (!face) return;

  face.classList.remove(
    "look-left",
    "look-right"
  );

  face.classList.add(
    direction === "left"
      ? "look-left"
      : "look-right"
  );

  setTimeout(() => {

    face.classList.remove(
      "look-left",
      "look-right"
    );

  }, 700);

}


export function startFaceLife() {

  setInterval(() => {

    if (
      state.listening ||
      state.thinking ||
      state.speaking
    ) {
      return;
    }

    if (Math.random() < 0.72) {
      blink();
    }

  }, 3500);


  setInterval(() => {

    if (
      state.listening ||
      state.thinking ||
      state.speaking
    ) {
      return;
    }

    look(
      Math.random() > 0.5
        ? "left"
        : "right"
    );

  }, 5500);

}
