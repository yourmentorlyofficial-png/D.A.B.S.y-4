import {
  state,
  setState
} from "./state.js";

import {
  startListening
} from "./speech.js";


const world =
  document.getElementById("dabsyWorld");

const face =
  document.getElementById("dabsyFace");


export function setupInteraction() {

  if (!world) return;


  world.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard") ||
        event.target.closest("button") ||
        event.target.closest("input")
      ) {
        return;
      }


      clearTimeout(state.touchTimer);


      state.touchTimer = setTimeout(() => {

        startListening();

      }, 300);

    }
  );


  world.addEventListener(
    "pointerup",
    () => {

      clearTimeout(state.touchTimer);

    }
  );


  world.addEventListener(
    "pointercancel",
    () => {

      clearTimeout(state.touchTimer);

    }
  );


  world.addEventListener(
    "dblclick",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest("button")
      ) {
        return;
      }


      document.dispatchEvent(
        new CustomEvent("dabsy:toggle-menu")
      );

    }
  );


  /* subtle future pet foundation */

  world.addEventListener(
    "pointermove",
    event => {

      if (
        !event.buttons ||
        !face
      ) {
        return;
      }


      const rect =
        face.getBoundingClientRect();


      const x =
        event.clientX - rect.left;


      if (x < rect.width / 2) {

        face.style.transform =
          "translateX(-3px)";

      } else {

        face.style.transform =
          "translateX(3px)";

      }

    }
  );


  world.addEventListener(
    "pointerleave",
    () => {

      if (!face) return;

      face.style.transform = "";

    }
  );

}
