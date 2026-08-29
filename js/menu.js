import {
  state,
  setState,
  updateStudyState
} from "./state.js";

import {
  speak
} from "./speech.js";


const world =
  document.getElementById("dabsyWorld");

const bubbleMenu =
  document.getElementById("bubbleMenu");

const studyBubble =
  document.getElementById("studyBubble");

const settingsBubble =
  document.getElementById("settingsBubble");


const settingsPanel =
  document.getElementById("settingsPanel");

const closeSettings =
  document.getElementById("closeSettings");

const apiKeyInput =
  document.getElementById("apiKeyInput");

const saveKey =
  document.getElementById("saveKey");

const keyStatus =
  document.getElementById("keyStatus");


export function setupMenu() {

  document.addEventListener(
    "dabsy:toggle-menu",
    toggleMenu
  );


  studyBubble.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      state.studyMode =
        !state.studyMode;


      localStorage.setItem(
        "dabsy_study_mode",
        String(state.studyMode)
      );


      updateStudyState();

      closeMenu();


      if (state.studyMode) {

        setState(
          "Study Mode",
          "Study mode activated. What are we learning?"
        );

        speak(
          "Study mode activated. What are we learning?"
        );

      }

      else {

        document.body.classList.remove(
          "complex-answer"
        );

        setState(
          "Normal Mode",
          "Back to normal. What's up?"
        );

        speak(
          "Back to normal. What's up?"
        );

      }

    }
  );


  settingsBubble.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      closeMenu();

      openSettings();

    }
  );


  closeSettings.addEventListener(
    "click",
    closeSettingsPanel
  );


  settingsPanel.addEventListener(
    "click",
    event => {

      if (
        event.target === settingsPanel
      ) {

        closeSettingsPanel();

      }

    }
  );


  saveKey.addEventListener(
    "click",
    saveGeminiKey
  );

}


export function toggleMenu() {

  state.menuOpen =
    !state.menuOpen;


  world.classList.toggle(
    "menu-open",
    state.menuOpen
  );


  bubbleMenu.setAttribute(
    "aria-hidden",
    String(!state.menuOpen)
  );

}


export function closeMenu() {

  state.menuOpen = false;

  world.classList.remove(
    "menu-open"
  );


  bubbleMenu.setAttribute(
    "aria-hidden",
    "true"
  );

}


function openSettings() {

  const saved =
    localStorage.getItem(
      "dabsy_gemini_key"
    ) || "";


  apiKeyInput.value =
    saved;


  keyStatus.textContent =
    saved
      ? "Gemini key saved on this device."
      : "No Gemini key connected.";


  settingsPanel.classList.add(
    "open"
  );


  settingsPanel.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeSettingsPanel() {

  settingsPanel.classList.remove(
    "open"
  );


  settingsPanel.setAttribute(
    "aria-hidden",
    "true"
  );

}


function saveGeminiKey() {

  const key =
    apiKeyInput.value.trim();


  if (!key) {

    keyStatus.textContent =
      "Please enter your Gemini API key.";

    return;

  }


  localStorage.setItem(
    "dabsy_gemini_key",
    key
  );


  keyStatus.textContent =
    "Gemini connected ✓";


  setTimeout(() => {

    closeSettingsPanel();


    setState(
      "Gemini Online",
      "My brain is online."
    );


    speak(
      "My brain is online."
    );

  }, 500);

}
