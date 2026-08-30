import {
  state,
  setState
} from "./state.js";

import {
  askDABSy
} from "./gemini.js";

import {
  speak as speakVoice
} from "./voice.js";


/* =========================================================
   D.A.B.S.y SPEECH ENGINE
   Crash-resistant version

   Flow:
   TOUCH
      ↓
   LISTENING
      ↓
   THINKING
      ↓
   GEMINI
      ↓
   RESPONSE
      ↓
   VOICE
      ↓
   IDLE
========================================================= */


const world =
  document.getElementById("dabsyWorld");


/* =========================================================
   SAFE STATE HELPERS
========================================================= */

function setWorldClass(className, enabled) {

  if (!world) return;

  world.classList.toggle(
    className,
    Boolean(enabled)
  );

}


function stopAllStates() {

  setWorldClass(
    "listening",
    false
  );

  setWorldClass(
    "thinking",
    false
  );

  setWorldClass(
    "speaking",
    false
  );

}


/* =========================================================
   SPEECH RECOGNITION SETUP
========================================================= */

export function setupSpeech() {

  try {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    /* Browser doesn't support voice recognition */

    if (!SpeechRecognition) {

      state.recognition = null;

      console.warn(
        "D.A.B.S.y: Speech Recognition unavailable."
      );

      return;

    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-IN";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;


    state.recognition =
      recognition;


    /* =====================================================
       MICROPHONE STARTED
    ===================================================== */

    recognition.onstart = () => {

      state.listening =
        true;

      state.thinking =
        false;


      setWorldClass(
        "thinking",
        false
      );

      setWorldClass(
        "listening",
        true
      );


      setState(
        "Listening",
        "I'm listening..."
      );

    };


    /* =====================================================
       SPEECH RESULT
    ===================================================== */

    recognition.onresult =
      event => {

        try {

          const transcript =
            event
              ?.results
              ?. [0]
              ?. [0]
              ?.transcript || "";


          const text =
            transcript.trim();


          if (!text) {

            setState(
              "Didn't catch that",
              "Try again."
            );

            return;

          }


          /*
             IMPORTANT:

             Do NOT directly manipulate the
             face here.

             Let handleQuestion() control
             the state transition.
          */

          handleQuestion(
            text
          );

        }

        catch (error) {

          console.error(
            "D.A.B.S.y speech result error:",
            error
          );

          recoverFromError(
            "I couldn't understand that. Try again."
          );

        }

      };


    /* =====================================================
       MICROPHONE ERROR
    ===================================================== */

    recognition.onerror =
      event => {

        state.listening =
          false;

        state.thinking =
          false;


        setWorldClass(
          "listening",
          false
        );

        setWorldClass(
          "thinking",
          false
        );


        const error =
          event?.error || "";


        console.warn(
          "D.A.B.S.y microphone:",
          error
        );


        if (
          error ===
          "not-allowed"
        ) {

          setState(
            "Microphone",
            "Microphone permission is blocked."
          );

        }

        else if (
          error ===
          "no-speech"
        ) {

          setState(
            "Listening",
            "I didn't hear anything."
          );

        }

        else if (
          error ===
          "audio-capture"
        ) {

          setState(
            "Microphone",
            "I can't access the microphone."
          );

        }

        else if (
          error ===
          "network"
        ) {

          setState(
            "Microphone",
            "The microphone connection failed."
          );

        }

        else {

          setState(
            "Microphone",
            "I couldn't hear that. Try again."
          );

        }

      };


    /* =====================================================
       MICROPHONE ENDED
    ===================================================== */

    recognition.onend =
      () => {

        state.listening =
          false;

        setWorldClass(
          "listening",
          false
        );

      };


    console.log(
      "D.A.B.S.y speech engine ready."
    );

  }

  catch (error) {

    console.error(
      "D.A.B.S.y speech setup failed:",
      error
    );


    state.recognition =
      null;

  }

}


/* =========================================================
   START LISTENING
========================================================= */

export function startListening() {

  try {

    /*
       If Gemini is already thinking,
       don't start another microphone session.
    */

    if (
      state.thinking
    ) {

      return;

    }


    /*
       If already listening,
       stop the current session.
    */

    if (
      state.listening
    ) {

      if (
        state.recognition
      ) {

        try {

          state.recognition.stop();

        }

        catch (_) {}

      }

      return;

    }


    /*
       Browser unsupported
    */

    if (
      !state.recognition
    ) {

      setState(
        "Voice unavailable",
        "Try Chrome on Android."
      );

      return;

    }


    /*
       Clear previous visual state
    */

    setWorldClass(
      "thinking",
      false
    );

    setWorldClass(
      "speaking",
      false
    );


    /*
       Start microphone
    */

    state.recognition.start();

  }

  catch (error) {

    /*
       Calling recognition.start()
       twice can throw an exception.

       Don't let that kill the app.
    */

    console.warn(
      "D.A.B.S.y recognition start:",
      error
    );

  }

}


/* =========================================================
   HANDLE QUESTION
========================================================= */

async function handleQuestion(
  userText
) {

  if (
    !userText
  ) {

    return;

  }


  /*
     Microphone is finished.
  */

  state.listening =
    false;


  setWorldClass(
    "listening",
    false
  );


  /*
     Enter THINKING state.
  */

  state.thinking =
    true;


  setWorldClass(
    "thinking",
    true
  );


  setState(
    state.studyMode
      ? "Study Mode"
      : "Thinking",

    state.studyMode
      ? "Let me work that out..."
      : "Let me think..."
  );


  try {

    /*
       Ask Gemini.

       This uses the existing
       gemini.js module.
    */

    const answer =
      await askDABSy(
        userText,
        Boolean(
          state.studyMode
        )
      );


    /*
       Validate Gemini response.
    */

    if (
      typeof answer !==
      "string" ||
      !answer.trim()
    ) {

      throw new Error(
        "EMPTY_GEMINI_RESPONSE"
      );

    }


    /*
       Gemini finished.
    */

    state.thinking =
      false;


    setWorldClass(
      "thinking",
      false
    );


    /*
       Clean old presentation.
    */

    document.body.classList.remove(
      "complex-answer"
    );


    /*
       Study Mode long-answer presentation.
    */

    const contentArea =
      document.getElementById(
        "contentArea"
      );

    const contentTitle =
      document.getElementById(
        "contentTitle"
      );

    const contentText =
      document.getElementById(
        "contentText"
      );


    const complex =
      Boolean(
        state.studyMode
      ) &&
      answer.length > 450;


    if (
      complex &&
      contentArea &&
      contentTitle &&
      contentText
    ) {

      contentTitle.textContent =
        "D.A.B.S.y explains";


      contentText.textContent =
        answer;


      document.body.classList.add(
        "complex-answer"
      );

    }


    /*
       Put answer into normal speech/subtitle area.
    */

    setState(
      state.studyMode
        ? "Study Mode"
        : "DABSy",

      answer
    );


    /*
       Speak answer.

       voice.js owns the actual
       speech synthesis system.
    */

    speak(
      answer
    );

  }

  catch (error) {

    recoverFromError(
      friendlyError(
        error
      )
    );

  }

}


/* =========================================================
   VOICE OUTPUT
========================================================= */

export function speak(
  text
) {

  try {

    if (
      typeof speakVoice ===
      "function"
    ) {

      speakVoice(
        String(text)
      );

      return;

    }


    /*
       Emergency fallback.

       This prevents DABSy from becoming
       completely silent if voice.js
       isn't available.
    */

    if (
      !(
        "speechSynthesis"
        in window
      )
    ) {

      return;

    }


    speechSynthesis.cancel();


    const clean =
      String(text)
        .replace(
          /[*_#`]/g,
          ""
        )
        .replace(
          /\n+/g,
          ". "
        );


    const utterance =
      new SpeechSynthesisUtterance(
        clean
      );


    const voices =
      speechSynthesis
        .getVoices();


    const preferred =
      voices.find(
        voice =>
          /en-IN/i.test(
            voice.lang
          )
      ) ||
      voices.find(
        voice =>
          /en-GB|en-US/i.test(
            voice.lang
          )
      );


    if (
      preferred
    ) {

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


    utterance.onstart =
      () => {

        state.speaking =
          true;

        setWorldClass(
          "speaking",
          true
        );

      };


    utterance.onend =
      () => {

        state.speaking =
          false;

        setWorldClass(
          "speaking",
          false
        );

      };


    utterance.onerror =
      () => {

        state.speaking =
          false;

        setWorldClass(
          "speaking",
          false
        );

      };


    speechSynthesis.speak(
      utterance
    );

  }

  catch (error) {

    console.warn(
      "D.A.B.S.y voice error:",
      error
    );

    state.speaking =
      false;

    setWorldClass(
      "speaking",
      false
    );

  }

}


/* =========================================================
   ERROR RECOVERY
========================================================= */

function recoverFromError(
  message
) {

  state.listening =
    false;

  state.thinking =
    false;


  setWorldClass(
    "listening",
    false
  );

  setWorldClass(
    "thinking",
    false
  );


  document.body.classList.remove(
    "complex-answer"
  );


  setState(
    "DABSy",
    message
  );

}


/* =========================================================
   FRIENDLY GEMINI ERRORS
========================================================= */

function friendlyError(
  error
) {

  const message =
    String(
      error?.message ||
      ""
    );


  const lower =
    message.toLowerCase();


  if (
    message ===
    "NO_API_KEY"
  ) {

    return (
      "Connect Gemini in Settings first."
    );

  }


  if (
    message ===
    "EMPTY_GEMINI_RESPONSE"
  ) {

    return (
      "Gemini didn't give me an answer. Try again."
    );

  }


  if (
    lower.includes(
      "api_key_invalid"
    ) ||
    lower.includes(
      "invalid api"
    ) ||
    lower.includes(
      "api key"
    )
  ) {

    return (
      "Your Gemini key looks invalid."
    );

  }


  if (
    message.includes(
      "429"
    ) ||
    lower.includes(
      "quota"
    ) ||
    lower.includes(
      "rate limit"
    )
  ) {

    return (
      "Gemini's usage limit was reached."
    );

  }


  if (
    message.includes(
      "404"
    ) ||
    lower.includes(
      "not found"
    )
  ) {

    return (
      "That Gemini model isn't available."
    );

  }


  if (
    lower.includes(
      "failed to fetch"
    ) ||
    lower.includes(
      "network"
    )
  ) {

    return (
      "I can't reach Gemini. Check your internet."
    );

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}
