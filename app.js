/* =========================================================
   D.A.B.S.y
   CRASH-PROOF APP.JS
   ========================================================= */

"use strict";

/* =========================================================
   SAFE DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const world = $("dabsyWorld");
const face = $("dabsyFace");
const speech = $("speech");
const status = $("status");

const bubbleMenu = $("bubbleMenu");
const studyBubble = $("studyBubble");
const settingsBubble = $("settingsBubble");

const settingsPanel = $("settingsPanel");
const closeSettings = $("closeSettings");

const apiKeyInput = $("apiKeyInput");
const saveKey = $("saveKey");
const keyStatus = $("keyStatus");

const contentArea = $("contentArea");
const contentTitle = $("contentTitle");
const contentText = $("contentText");
const visualArea = $("visualArea");

const leftHand = $("leftHand");
const rightHand = $("rightHand");


/* =========================================================
   STATE
   ========================================================= */

let listening = false;
let thinking = false;
let speaking = false;
let menuOpen = false;

let touchTimer = null;
let booted = false;

let recognition = null;

let studyMode =
  localStorage.getItem("dabsy_study_mode") === "true";


/* =========================================================
   SAFE CLASS HELPERS
   ========================================================= */

function addClass(element, name) {
  if (element) {
    element.classList.add(name);
  }
}

function removeClass(element, name) {
  if (element) {
    element.classList.remove(name);
  }
}

function toggleClass(element, name, state) {
  if (element) {
    element.classList.toggle(name, state);
  }
}


/* =========================================================
   BASIC UI
   ========================================================= */

function setState(title, text) {

  if (status) {
    status.textContent = title || "";
  }

  if (speech) {
    speech.textContent = text || "";
  }

}


/* =========================================================
   STUDY MODE
   ========================================================= */

function updateStudyMode() {

  document.body.classList.toggle(
    "study-mode",
    studyMode
  );

}


/* =========================================================
   MENU
   ========================================================= */

function closeMenu() {

  menuOpen = false;

  removeClass(world, "menu-open");

  if (bubbleMenu) {

    bubbleMenu.setAttribute(
      "aria-hidden",
      "true"
    );

  }

}


function toggleMenu() {

  menuOpen = !menuOpen;

  toggleClass(
    world,
    "menu-open",
    menuOpen
  );

  if (bubbleMenu) {

    bubbleMenu.setAttribute(
      "aria-hidden",
      String(!menuOpen)
    );

  }

}


/* =========================================================
   TOUCH / INTERACTION
   ========================================================= */

function setupTouch() {

  if (!world) {
    console.warn("DABSy: #dabsyWorld missing.");
    return;
  }


  world.addEventListener(
    "pointerdown",
    handlePointerDown
  );


  world.addEventListener(
    "pointerup",
    handlePointerUp
  );


  world.addEventListener(
    "pointercancel",
    handlePointerUp
  );


  world.addEventListener(
    "pointerleave",
    handlePointerUp
  );


  world.addEventListener(
    "dblclick",
    handleDoubleClick
  );

}


function handlePointerDown(event) {

  const target = event.target;

  if (
    target &&
    typeof target.closest === "function" &&
    (
      target.closest(".bubble") ||
      target.closest(".settingsCard")
    )
  ) {
    return;
  }


  clearTimeout(touchTimer);


  touchTimer = setTimeout(
    () => {

      touchTimer = null;

      startListening();

    },
    300
  );

}


function handlePointerUp() {

  if (touchTimer) {

    clearTimeout(touchTimer);

    touchTimer = null;

  }

}


function handleDoubleClick(event) {

  const target = event.target;

  if (
    target &&
    typeof target.closest === "function" &&
    (
      target.closest(".bubble") ||
      target.closest(".settingsCard")
    )
  ) {
    return;
  }

  toggleMenu();

}


/* =========================================================
   MENU BUTTONS
   ========================================================= */

function setupMenu() {

  if (studyBubble) {

    studyBubble.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        studyMode = !studyMode;

        localStorage.setItem(
          "dabsy_study_mode",
          String(studyMode)
        );

        updateStudyMode();

        closeMenu();


        if (studyMode) {

          const message =
            "Study mode activated. What are we learning?";

          setState(
            "Study Mode",
            message
          );

          speak(message);

        } else {

          const message =
            "Back to normal. What's up?";

          setState(
            "Normal Mode",
            message
          );

          speak(message);

        }

      }
    );

  }


  if (settingsBubble) {

    settingsBubble.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        closeMenu();

        openSettings();

      }
    );

  }

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

  if (!settingsPanel) {
    return;
  }


  const saved =
    localStorage.getItem(
      "dabsy_gemini_key"
    ) || "";


  if (apiKeyInput) {
    apiKeyInput.value = saved;
  }


  if (keyStatus) {

    keyStatus.textContent =
      saved
        ? "Gemini key saved on this device."
        : "No Gemini key connected.";

  }


  settingsPanel.classList.add("open");

}


function closeSettingsPanel() {

  if (settingsPanel) {

    settingsPanel.classList.remove(
      "open"
    );

  }

}


function setupSettings() {

  if (closeSettings) {

    closeSettings.addEventListener(
      "click",
      closeSettingsPanel
    );

  }


  if (settingsPanel) {

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

  }


  if (saveKey) {

    saveKey.addEventListener(
      "click",
      saveGeminiKey
    );

  }

}


function saveGeminiKey() {

  const key =
    apiKeyInput
      ? apiKeyInput.value.trim()
      : "";


  if (!key) {

    if (keyStatus) {

      keyStatus.textContent =
        "Please enter your Gemini API key.";

    }

    return;

  }


  localStorage.setItem(
    "dabsy_gemini_key",
    key
  );


  if (keyStatus) {

    keyStatus.textContent =
      "Gemini connected ✓";

  }


  setTimeout(
    () => {

      closeSettingsPanel();

      setState(
        "Gemini Online",
        "My brain is online."
      );

      speak(
        "My brain is online."
      );

    },
    500
  );

}


/* =========================================================
   SPEECH RECOGNITION
   ========================================================= */

function setupSpeech() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    recognition = null;

    console.log(
      "DABSy: Speech Recognition unavailable."
    );

    return;

  }


  try {

    recognition =
      new SpeechRecognition();

  } catch (error) {

    console.error(
      "DABSy: Speech Recognition setup failed.",
      error
    );

    recognition = null;

    return;

  }


  recognition.lang =
    "en-IN";

  recognition.continuous =
    false;

  recognition.interimResults =
    false;

  recognition.maxAlternatives =
    1;


  recognition.onstart =
    () => {

      listening = true;

      addClass(
        world,
        "listening"
      );

      setState(
        "Listening",
        "I'm listening..."
      );

    };


  recognition.onresult =
    event => {

      const transcript =
        event
          ?.results
          ?.[
            0
          ]
          ?.[0]
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


      askDABSy(text);

    };


  recognition.onerror =
    event => {

      listening = false;

      removeClass(
        world,
        "listening"
      );


      const error =
        event?.error || "";


      if (error === "not-allowed") {

        setState(
          "Microphone",
          "Microphone permission is blocked."
        );

      } else if (
        error === "no-speech"
      ) {

        setState(
          "Listening",
          "I didn't hear anything."
        );

      } else {

        setState(
          "Microphone",
          "I couldn't hear that. Try again."
        );

      }

    };


  recognition.onend =
    () => {

      listening = false;

      removeClass(
        world,
        "listening"
      );

    };

}


/* =========================================================
   START LISTENING
   ========================================================= */

function startListening() {

  closeMenu();


  if (!recognition) {

    setState(
      "Voice unavailable",
      "Try Chrome on Android."
    );

    return;

  }


  if (listening) {

    try {

      recognition.stop();

    } catch (error) {

      console.warn(
        "DABSy: recognition stop failed.",
        error
      );

    }

    return;

  }


  try {

    recognition.start();

  } catch (error) {

    console.warn(
      "DABSy: recognition start failed.",
      error
    );

  }

}


/* =========================================================
   GEMINI
   ========================================================= */

async function askDABSy(userText) {

  const apiKey =
    localStorage.getItem(
      "dabsy_gemini_key"
    );


  if (!apiKey) {

    const message =
      "Double tap me and connect Gemini in Settings.";

    setState(
      "Gemini Offline",
      message
    );

    speak(
      "Please connect Gemini in Settings first."
    );

    return;

  }


  thinking = true;

  addClass(
    world,
    "thinking"
  );


  setState(
    studyMode
      ? "Study Mode"
      : "Thinking",
    "Let me think..."
  );


  const systemPrompt =
    studyMode

      ? `
You are D.A.B.S.y, a friendly AI desk study companion.

The user is a Class 11 Science student in India.

You are in STUDY MODE.

Explain things clearly and simply.
Break difficult problems into logical steps.
Teach the reasoning instead of only giving the final answer.
Use examples when useful.
For maths and science, show important working.
Keep spoken answers reasonably concise.
Never say "As an AI".
Sound natural, friendly and slightly playful.

When explaining a long topic:
1. Start with a short idea.
2. Break it into sections.
3. Use simple examples.
4. End with a short recap.

Do not make every answer unnecessarily long.
`

      : `
You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.
Keep ordinary conversation concise.
Help with studying, planning, ideas and questions.
Never say "As an AI".
You are a desk companion, not a formal chatbot.

You can have personality, but do not become overly childish.
`;


  try {

    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey
          },

          body: JSON.stringify({

            systemInstruction: {
              parts: [
                {
                  text:
                    systemPrompt
                }
              ]
            },

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text:
                      userText
                  }
                ]
              }
            ],

            generationConfig: {

              temperature:
                0.8,

              maxOutputTokens:
                900

            }

          })

        }
      );


    let data = null;


    try {

      data =
        await response.json();

    } catch (jsonError) {

      throw new Error(
        "Gemini returned an unreadable response."
      );

    }


    if (!response.ok) {

      throw new Error(
        data?.error?.message ||
        `Gemini error ${response.status}`
      );

    }


    const answer =
      data
        ?.candidates
        ?.[0]
        ?.content
        ?.parts
        ?.map(
          part =>
            part?.text || ""
        )
        .join("")
        .trim();


    if (!answer) {

      throw new Error(
        "Gemini returned no answer."
      );

    }


    thinking = false;

    removeClass(
      world,
      "thinking"
    );


    displayAnswer(
      answer
    );


    speak(
      answer
    );


    randomHand();


  } catch (error) {

    thinking = false;

    removeClass(
      world,
      "thinking"
    );

    removeClass(
      document.body,
      "complex-answer"
    );


    console.error(
      "DABSy Gemini:",
      error
    );


    setState(
      "Gemini Error",
      friendlyError(error)
    );

  }

}


/* =========================================================
   ANSWER PRESENTATION
   ========================================================= */

function displayAnswer(answer) {

  const complex =
    studyMode &&
    answer.length > 450;


  if (
    complex &&
    contentArea &&
    contentTitle &&
    contentText
  ) {

    contentTitle.textContent =
      "📚 D.A.B.S.y explains";

    contentText.textContent =
      answer;

    addClass(
      document.body,
      "complex-answer"
    );

  } else {

    removeClass(
      document.body,
      "complex-answer"
    );

  }


  setState(
    studyMode
      ? "Study Mode"
      : "DABSy",
    answer
  );

}


/* =========================================================
   ERROR HANDLING
   ========================================================= */

function friendlyError(error) {

  const message =
    String(
      error?.message || ""
    );


  const lower =
    message.toLowerCase();


  if (
    lower.includes(
      "api_key_invalid"
    ) ||
    (
      lower.includes("api key") &&
      lower.includes("invalid")
    )
  ) {

    return "Your Gemini key looks invalid.";

  }


  if (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {

    return "Gemini's usage limit was reached.";

  }


  if (
    message.includes("404") ||
    lower.includes("not found")
  ) {

    return "That Gemini model isn't available.";

  }


  if (
    lower.includes("failed to fetch") ||
    lower.includes("network")
  ) {

    return "I can't reach Gemini. Check your internet.";

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  try {

    speechSynthesis.cancel();

  } catch (error) {

    console.warn(
      "DABSy: speech cancel failed.",
      error
    );

  }


  const clean =
    String(text || "")
      .replace(
        /[*_#`]/g,
        ""
      )
      .replace(
        /\n+/g,
        ". "
      )
      .trim();


  if (!clean) {
    return;
  }


  const voices =
    speechSynthesis.getVoices();


  const preferred =
    voices.find(
      voice =>
        /en-IN/i.test(
          voice.lang || ""
        )
    ) ||

    voices.find(
      voice =>
        /en-GB/i.test(
          voice.lang || ""
        )
    ) ||

    voices.find(
      voice =>
        /en-US/i.test(
          voice.lang || ""
        )
    );


  const utterance =
    new SpeechSynthesisUtterance(
      clean
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


  utterance.volume =
    1;


  utterance.onstart =
    () => {

      speaking = true;

      addClass(
        world,
        "speaking"
      );

    };


  utterance.onend =
    () => {

      speaking = false;

      removeClass(
        world,
        "speaking"
      );

    };


  utterance.onerror =
    () => {

      speaking = false;

      removeClass(
        world,
        "speaking"
      );

    };


  try {

    speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    console.warn(
      "DABSy: speech failed.",
      error
    );

  }

}


/* =========================================================
   VOICE LIST REFRESH
   ========================================================= */

if (
  "speechSynthesis" in window
) {

  speechSynthesis.onvoiceschanged =
    () => {

      console.log(
        "DABSy: voices loaded."
      );

    };

}


/* =========================================================
   CUTE HANDS
   ========================================================= */

function randomHand() {

  if (
    !leftHand &&
    !rightHand
  ) {
    return;
  }


  if (
    Math.random() > 0.25
  ) {
    return;
  }


  const availableHands = [];


  if (leftHand) {
    availableHands.push(
      leftHand
    );
  }


  if (rightHand) {
    availableHands.push(
      rightHand
    );
  }


  if (!availableHands.length) {
    return;
  }


  const hand =
    availableHands[
      Math.floor(
        Math.random() *
        availableHands.length
      )
    ];


  addClass(
    hand,
    "visible"
  );


  setTimeout(
    () => {

      removeClass(
        hand,
        "visible"
      );

    },
    1100
  );

}


/* =========================================================
   BLINKING
   ========================================================= */

function setupBlinking() {

  if (!face) {
    return;
  }


  setInterval(
    () => {

      if (
        listening ||
        thinking ||
        speaking
      ) {
        return;
      }


      addClass(
        face,
        "blink"
      );


      setTimeout(
        () => {

          removeClass(
            face,
            "blink"
          );

        },
        150
      );

    },
    3500
  );

}


/* =========================================================
   IDLE EYE MOVEMENT
   ========================================================= */

function setupEyeMovement() {

  if (!face) {
    return;
  }


  setInterval(
    () => {

      if (
        listening ||
        thinking ||
        speaking
      ) {
        return;
      }


      const direction =
        Math.random() > 0.5
          ? "look-left"
          : "look-right";


      addClass(
        face,
        direction
      );


      setTimeout(
        () => {

          removeClass(
            face,
            direction
          );

        },
        700
      );

    },
    5500
  );

}


/* =========================================================
   STARTUP
   ========================================================= */

function boot() {

  if (booted) {
    return;
  }


  booted = true;


  console.log(
    "DABSy booting..."
  );


  updateStudyMode();


  setState(
    "DABSy Online",
    "Hello! I'm DABSy. Tap & hold me. 💙"
  );


  setupTouch();

  setupMenu();

  setupSettings();

  setupSpeech();

  setupBlinking();

  setupEyeMovement();


  c
