/* =========================================================
   D.A.B.S.y — PREMIUM APP ENGINE
   Stable base + expressions + pet interaction + Easter eggs
========================================================= */

(() => {

"use strict";

/* =========================================================
   SAFE ELEMENT LOOKUP
========================================================= */

const $ = id => document.getElementById(id);

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

const leftHand = $("leftHand");
const rightHand = $("rightHand");

if (!world || !face || !speech || !status) {
  console.error("D.A.B.S.y: essential interface elements missing.");
  return;
}

/* =========================================================
   STATE
========================================================= */

let listening = false;
let thinking = false;
let speaking = false;
let menuOpen = false;

let touchTimer = null;
let touchStartTime = 0;
let touchMoved = false;

let recognition = null;
let currentExpression = "idle";

let tapCount = 0;
let lastTapTime = 0;

let studyMode =
  localStorage.getItem("dabsy_study_mode") === "true";

/* =========================================================
   BASIC UI
========================================================= */

function setState(title, text) {

  if (status) {
    status.textContent = title;
  }

  if (speech) {
    speech.textContent = text;
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

  world.classList.remove("menu-open");

  if (bubbleMenu) {
    bubbleMenu.setAttribute(
      "aria-hidden",
      "true"
    );
  }

}


function toggleMenu() {

  menuOpen = !menuOpen;

  world.classList.toggle(
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
   EXPRESSION ENGINE
========================================================= */

const expressionNames = [
  "idle",
  "happy",
  "sad",
  "thinking",
  "listening",
  "excited",
  "confused",
  "sleepy"
];


function setExpression(expression, duration = 0) {

  if (!face) return;

  expression =
    expressionNames.includes(expression)
      ? expression
      : "idle";

  expressionNames.forEach(name => {

    face.classList.remove(
      `expression-${name}`
    );

  });

  face.classList.add(
    `expression-${expression}`
  );

  currentExpression = expression;

  if (duration > 0) {

    setTimeout(() => {

      if (
        currentExpression === expression &&
        !listening &&
        !thinking
      ) {

        setExpression("idle");

      }

    }, duration);

  }

}


/* =========================================================
   PREMIUM IDLE EXPRESSION
========================================================= */

function randomIdleExpression() {

  if (
    listening ||
    thinking ||
    speaking ||
    menuOpen
  ) {
    return;
  }

  const roll = Math.random();

  if (roll < 0.08) {

    setExpression(
      "sleepy",
      1800
    );

  } else if (roll < 0.15) {

    setExpression(
      "happy",
      1400
    );

  } else if (roll < 0.20) {

    setExpression(
      "confused",
      1000
    );

  } else {

    setExpression("idle");

  }

}


/* =========================================================
   TOUCH / PET SYSTEM
========================================================= */

function setupTouch() {

  world.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard")
      ) {
        return;
      }

      touchMoved = false;

      touchStartTime =
        performance.now();

      clearTimeout(touchTimer);

      touchTimer = setTimeout(
        () => {

          if (!touchMoved) {
            startListening();
          }

        },
        320
      );

    },
    { passive: true }
  );


  world.addEventListener(
    "pointermove",
    () => {

      touchMoved = true;

    },
    { passive: true }
  );


  world.addEventListener(
    "pointerup",
    event => {

      clearTimeout(touchTimer);

      const duration =
        performance.now() -
        touchStartTime;

      /*
        Short tap = pet DABSy.
        Long hold = voice.
      */

      if (
        duration < 300 &&
        !touchMoved
      ) {

        petDABSy(event);

      }

    },
    { passive: true }
  );


  world.addEventListener(
    "pointercancel",
    () => {

      clearTimeout(touchTimer);

    },
    { passive: true }
  );


  world.addEventListener(
    "dblclick",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard")
      ) {
        return;
      }

      toggleMenu();

    }
  );

}


/* =========================================================
   PET DABSY
========================================================= */

function petDABSy() {

  if (
    listening ||
    thinking
  ) {
    return;
  }

  setExpression(
    "happy",
    1000
  );

  world.classList.add(
    "petted"
  );

  setState(
    "DABSy",
    "hehe 💙"
  );

  randomHand();

  setTimeout(() => {

    world.classList.remove(
      "petted"
    );

  }, 700);


  /*
     Tap streak Easter eggs.
  */

  const now =
    Date.now();

  if (
    now - lastTapTime <
    1300
  ) {

    tapCount++;

  } else {

    tapCount = 1;

  }

  lastTapTime = now;


  if (tapCount === 3) {

    setExpression(
      "excited",
      1800
    );

    setState(
      "DABSy",
      "Okay okay, I know I'm cute. 😭"
    );

    speak(
      "Okay okay, I know I'm cute."
    );

  }


  if (tapCount >= 7) {

    tapCount = 0;

    setExpression(
      "confused",
      1600
    );

    setState(
      "DABSy",
      "Are you testing me? 👁️"
    );

    speak(
      "Are you testing me?"
    );

  }

}


/* =========================================================
   MENU
========================================================= */

function setupMenu() {

  if (studyBubble) {

    studyBubble.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        studyMode =
          !studyMode;

        localStorage.setItem(
          "dabsy_study_mode",
          String(studyMode)
        );

        updateStudyMode();
        closeMenu();

        if (studyMode) {

          setExpression(
            "excited",
            1600
          );

          setState(
            "Study Mode",
            "Study mode activated. What are we learning?"
          );

          speak(
            "Study mode activated. What are we learning?"
          );

        } else {

          setExpression(
            "happy",
            1200
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

  if (
    !settingsPanel ||
    !apiKeyInput ||
    !keyStatus
  ) {
    return;
  }

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
          event.target ===
          settingsPanel
        ) {

          closeSettingsPanel();

        }

      }
    );

  }


  if (saveKey) {

    saveKey.addEventListener(
      "click",
      () => {

        const key =
          apiKeyInput?.value.trim();

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

            setExpression(
              "excited",
              1500
            );

            setState(
              "Gemini Online",
              "My brain is online. 🧠"
            );

            speak(
              "My brain is online."
            );

          },
          500
        );

      }
    );

  }

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

    return;

  }

  try {

    recognition =
      new SpeechRecognition();

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

        world.classList.add(
          "listening"
        );

        setExpression(
          "listening"
        );

        setState(
          "Listening",
          "I'm listening... 👂"
        );

      };


    recognition.onresult =
      event => {

        const transcript =
          event.results?.[0]?.[0]?.transcript ||
          "";

        const text =
          transcript.trim();

        if (!text) {

          setExpression(
            "confused",
            900
          );

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

        world.classList.remove(
          "listening"
        );

        if (
          event.error ===
          "not-allowed"
        ) {

          setExpression(
            "sad",
            1300
          );

          setState(
            "Microphone",
            "Microphone permission is blocked."
          );

        } else if (
          event.error ===
          "no-speech"
        ) {

          setExpression(
            "confused",
            1000
          );

          setState(
            "Listening",
            "I didn't hear anything."
          );

        } else {

          setExpression(
            "sad",
            1200
          );

          setState(
            "Microphone",
            "I couldn't hear that. Try again."
          );

        }

      };


    recognition.onend =
      () => {

        listening = false;

        world.classList.remove(
          "listening"
        );

        if (
          !thinking
        ) {

          setExpression(
            "idle"
          );

        }

      };

  } catch (error) {

    console.error(
      "Speech setup failed:",
      error
    );

    recognition =
      null;

  }

}


/* =========================================================
   LISTEN
========================================================= */

function startListening() {

  closeMenu();

  if (!recognition) {

    setExpression(
      "sad",
      1200
    );

    setState(
      "Voice unavailable",
      "Try Chrome on Android."
    );

    return;

  }

  if (listening) {

    try {
      recognition.stop();
    } catch {}

    return;

  }

  try {

    recognition.start();

  } catch (error) {

    console.log(
      "Recognition start:",
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

    setExpression(
      "confused",
      1400
    );

    setState(
      "Gemini Offline",
      "Double tap me and connect Gemini in Settings."
    );

    speak(
      "Please connect Gemini in Settings first."
    );

    return;

  }

  thinking = true;

  world.classList.add(
    "thinking"
  );

  setExpression(
    "thinking"
  );

  setState(
    studyMode
      ? "Study Mode"
      : "Thinking",
    "Let me think... 🧠"
  );


  const systemPrompt =
    studyMode

      ? `
You are D.A.B.S.y, a friendly AI desk study companion.

The user is a Class 11 Science student in India.

You are in STUDY MODE.

Explain clearly and simply.
Break difficult problems into logical steps.
Teach the reasoning instead of only giving the final answer.
Use examples when useful.
For maths and science, show important working.

Structure longer answers clearly with headings,
short paragraphs and numbered steps.

Keep spoken answers reasonably concise.
Never say "As an AI".
Sound natural, friendly and slightly playful.
`

      : `
You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.

Keep ordinary conversation concise.
Help with studying, planning, ideas and questions.
Use a little personality without becoming distracting.

Never say "As an AI".
You are a desk companion, not a formal chatbot.
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

          body:
            JSON.stringify({

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


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data?.error?.message ||
        `Gemini error ${response.status}`
      );

    }


    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(
          part =>
            part.text || ""
        )
        .join("")
        .trim();


    if (!answer) {

      throw new Error(
        "Gemini returned no answer."
      );

    }


    thinking = false;

    world.classList.remove(
      "thinking"
    );


    const complex =
      studyMode &&
      answer.length > 450;


    if (complex) {

      if (contentTitle) {

        contentTitle.textContent =
          "📚 D.A.B.S.y explains";

      }

      if (contentText) {

        contentText.textContent =
          answer;

      }

      document.body.classList.add(
        "complex-answer"
      );

      setExpression(
        "happy"
      );

    } else {

      document.body.classList.remove(
        "complex-answer"
      );

      setExpression(
        answer.length > 180
          ? "happy"
          : "idle"
      );

    }


    setState(
      studyMode
        ? "Study Mode"
        : "DABSy",
      answer
    );


    speak(answer);

    randomHand();

  } catch (error) {

    thinking = false;

    world.classList.remove(
      "thinking"
    );

    document.body.classList.remove(
      "complex-answer"
    );

    console.error(
      "DABSy Gemini:",
      error
    );

    setExpression(
      "sad",
      1400
    );

    setState(
      "Gemini Error",
      friendlyError(error)
    );

  }

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
    lower.includes(
      "invalid api key"
    )
  ) {

    return "Your Gemini key looks invalid.";

  }


  if (
    message.includes("429") ||
    lower.includes("quota")
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
    lower.includes(
      "failed to fetch"
    )
  ) {

    return "I can't reach Gemini. Check your internet.";

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}


/* =========================================================
   VOICE
========================================================= */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }


  try {

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


    const voices =
      speechSynthesis.getVoices();


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
      1.12;


    utterance.onstart =
      () => {

        speaking = true;

        world.classList.add(
          "speaking"
        );

      };


    utterance.onend =
      () => {

        speaking = false;

        world.classList.remove(
          "speaking"
        );

        if (
          !listening &&
          !thinking
        ) {

          setExpression(
            "idle"
          );

        }

      };


    utterance.onerror =
      () => {

        speaking = false;

        world.classList.remove(
          "speaking"
        );

      };


    speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    console.error(
      "Sp
