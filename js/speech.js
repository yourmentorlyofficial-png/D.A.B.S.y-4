import {
  state,
  setState
} from "./state.js";

import {
  askDABSy
} from "./gemini.js";


const world =
  document.getElementById("dabsyWorld");


export function setupSpeech() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    state.recognition = null;

    return;

  }


  state.recognition =
    new SpeechRecognition();


  state.recognition.lang =
    "en-IN";

  state.recognition.continuous =
    false;

  state.recognition.interimResults =
    false;

  state.recognition.maxAlternatives =
    1;


  state.recognition.onstart = () => {

    state.listening = true;

    world.classList.add(
      "listening"
    );


    setState(
      "Listening",
      "I'm listening..."
    );

  };


  state.recognition.onresult = event => {

    const transcript =
      event.results?.[0]?.[0]?.transcript || "";


    const text =
      transcript.trim();


    if (!text) {

      setState(
        "Didn't catch that",
        "Try again."
      );

      return;

    }


    askDABSy(text);

  };


  state.recognition.onerror = event => {

    state.listening = false;

    world.classList.remove(
      "listening"
    );


    if (
      event.error === "not-allowed"
    ) {

      setState(
        "Microphone",
        "Microphone permission is blocked."
      );

    }

    else if (
      event.error === "no-speech"
    ) {

      setState(
        "Listening",
        "I didn't hear anything."
      );

    }

    else {

      setState(
        "Microphone",
        "I couldn't hear that. Try again."
      );

    }

  };


  state.recognition.onend = () => {

    state.listening = false;

    world.classList.remove(
      "listening"
    );

  };

}


export function startListening() {

  if (!state.recognition) {

    setState(
      "Voice unavailable",
      "Try Chrome on Android."
    );

    return;

  }


  if (state.listening) {

    state.recognition.stop();

    return;

  }


  try {

    state.recognition.start();

  }

  catch (error) {

    console.log(
      "Recognition:",
      error
    );

  }

}


export function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }


  speechSynthesis.cancel();


  const clean =
    String(text)
      .replace(/[*_#`]/g, "")
      .replace(/\n+/g, ". ");


  const utterance =
    new SpeechSynthesisUtterance(
      clean
    );


  const voices =
    speechSynthesis.getVoices();


  const preferred =
    voices.find(
      voice =>
        /en-IN/i.test(voice.lang)
    ) ||
    voices.find(
      voice =>
        /en-GB|en-US/i.test(voice.lang)
    );


  if (preferred) {

    utterance.voice =
      preferred;

  }


  utterance.lang =
    preferred?.lang ||
    "en-IN";


  utterance.rate =
    0.98;

  utterance.pitch =
    1.15;


  utterance.onstart = () => {

    state.speaking = true;

    world.classList.add(
      "speaking"
    );

  };


  utterance.onend = () => {

    state.speaking = false;

    world.classList.remove(
      "speaking"
    );

  };


  speechSynthesis.speak(
    utterance
  );

}
