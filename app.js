/* =========================================================
   D.A.B.S.y — PERSONALITY CORE
   Full app.js replacement
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
   ========================================================= */

const world = document.getElementById("dabsyWorld");
const face = document.getElementById("dabsyFace");
const speech = document.getElementById("speech");
const status = document.getElementById("status");

const bubbleMenu = document.getElementById("bubbleMenu");
const studyBubble = document.getElementById("studyBubble");
const settingsBubble = document.getElementById("settingsBubble");

const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const apiKeyInput = document.getElementById("apiKeyInput");
const saveKey = document.getElementById("saveKey");
const keyStatus = document.getElementById("keyStatus");

const contentArea = document.getElementById("contentArea");
const contentTitle = document.getElementById("contentTitle");
const contentText = document.getElementById("contentText");

const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");


/* =========================================================
   STATE
   ========================================================= */

let listening = false;
let thinking = false;
let speaking = false;
let menuOpen = false;

let touchTimer = null;
let touchStartX = 0;
let touchStartY = 0;

let recognition = null;

let studyMode =
  localStorage.getItem("dabsy_study_mode") === "true";

let lastInteraction = Date.now();
let idleTimer = null;
let expressionTimer = null;
let easterEggCooldown = false;


/* =========================================================
   SMALL HELPERS
   ========================================================= */

function isBusy() {
  return listening || thinking || speaking;
}


function setState(title, text) {
  if (status) {
    status.textContent = title;
  }

  if (speech) {
    speech.textContent = text;
  }

  lastInteraction = Date.now();
}


function updateStudyMode() {
  document.body.classList.toggle(
    "study-mode",
    studyMode
  );
}


function clearExpressions() {
  if (!face) return;

  face.classList.remove(
    "blink",
    "look-left",
    "look-right",
    "happy",
    "confused",
    "surprised",
    "sleepy",
    "sad",
    "curious"
  );
}


function expression(name, duration = 900) {
  if (!face) return;

  clearExpressions();

  face.classList.add(name);

  if (duration > 0) {
    setTimeout(() => {
      face.classList.remove(name);
    }, duration);
  }
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

  if (menuOpen) {
    expression("curious", 700);
  }
}


/* =========================================================
   TOUCH / INTERACTION
   =========================================================

   Tap:
     gentle reaction

   Long press:
     microphone

   Double tap:
     menu

   Drag/rub:
     cute pet reaction
   ========================================================= */

function setupTouch() {

  if (!world) return;


  world.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard")
      ) {
        return;
      }

      touchStartX = event.clientX;
      touchStartY = event.clientY;

      clearTimeout(touchTimer);

      touchTimer = setTimeout(() => {

        if (!isBusy()) {
          startListening();
        }

      }, 420);

    }
  );


  world.addEventListener(
    "pointermove",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard")
      ) {
        return;
      }

      const dx =
        Math.abs(event.clientX - touchStartX);

      const dy =
        Math.abs(event.clientY - touchStartY);


      /*
        Moving your finger around D.A.B.S.y
        acts like gently rubbing/petting.
      */

      if (dx > 12 || dy > 12) {

        clearTimeout(touchTimer);

        petDABSy();

      }

    }
  );


  world.addEventListener(
    "pointerup",
    event => {

      clearTimeout(touchTimer);

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard")
      ) {
        return;
      }

      if (!isBusy()) {
        gentleTapReaction();
      }

    }
  );


  world.addEventListener(
    "pointercancel",
    () => {
      clearTimeout(touchTimer);
    }
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
   TAP REACTION
   ========================================================= */

function gentleTapReaction() {

  lastInteraction = Date.now();

  const reactions = [
    "happy",
    "curious",
    "surprised"
  ];

  const reaction =
    reactions[
      Math.floor(
        Math.random() * reactions.length
      )
    ];

  expression(reaction, 700);

  maybeEasterEgg();
}


/* =========================================================
   PET / RUB
   ========================================================= */

function petDABSy() {

  if (isBusy()) return;

  lastInteraction = Date.now();

  world.classList.add("petting");

  expression("happy", 550);

  setState(
    "DABSy",
    randomPetMessage()
  );

  showHand();

  setTimeout(() => {
    world.classList.remove("petting");
  }, 600);

}


function randomPetMessage() {

  const messages = [
    "Hehe. ✨",
    "That tickles.",
    "Okay okay, I noticed. 💙",
    "Boop detected.",
    "You found the pet button.",
    "Processing affection...",
    "Tiny happiness acquired.",
    "I approve of this interaction.",
    "Again? 👀",
    "DABSy.exe feels appreciated."
  ];

  return messages[
    Math.floor(
      Math.random() * messages.length
    )
  ];

}


/* =========================================================
   HANDS
   ========================================================= */

function showHand() {

  const hand =
    Math.random() > 0.5
      ? leftHand
      : rightHand;

  if (!hand) return;

  hand.classList.add("visible");

  setTimeout(() => {

    hand.classList.remove("visible");

  }, 900);

}


function randomHand() {

  if (Math.random() > 0.45) {
    return;
  }

  showHand();

}


/* =========================================================
   MENU SETUP
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

          expression("happy", 900);

          setState(
            "Study Mode",
            "Study mode activated. What are we learning?"
          );

          speak(
            "Study mode activated. What are we learning?"
          );

        } else {

          expression("happy", 700);

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

  settingsPanel.classList.remove("open");

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
      () => {

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

        expression("happy", 1000);

        setTimeout(() => {

          closeSettingsPanel();

          setState(
            "Gemini Online",
            "My brain is online. 💙"
          );

          speak(
            "My brain is online."
          );

        }, 500);

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


  recognition =
    new SpeechRecognition();

  recognition.lang = "en-IN";

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.maxAlternatives = 1;


  recognition.onstart = () => {

    listening = true;

    world.classList.remove(
      "thinking",
      "speaking"
    );

    world.classList.add(
      "listening"
    );

    expression("curious", 0);

    setState(
      "Listening",
      "I'm listening... 👂"
    );

  };


  recognition.onresult = event => {

    const transcript =
      event.results?.[0]?.[0]?.transcript || "";

    const text =
      transcript.trim();


    if (!text) {

      setState(
        "Didn't catch that",
        "Try again."
      );

      expression("confused", 800);

      return;

    }


    askDABSy(text);

  };


  recognition.onerror = event => {

    listening = false;

    world.classList.remove(
      "listening"
    );


    if (
      event.error === "not-allowed"
    ) {

      expression("sad", 900);

      setState(
        "Microphone",
        "Microphone permission is blocked."
      );

    } else if (
      event.error === "no-speech"
    ) {

      expression("confused", 700);

      setState(
        "Listening",
        "I didn't hear anything."
      );

    } else {

      expression("confused", 800);

      setState(
        "Microphone",
        "I couldn't hear that. Try again."
      );

    }

  };


  recognition.onend = () => {

    listening = false;

    world.classList.remove(
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

    recognition.stop();

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

    expression("confused", 900);

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

  world.classList.remove(
    "listening",
    "speaking"
  );

  world.classList.add(
    "thinking"
  );

  expression("curious", 0);


  setState(
    studyMode
      ? "Study Mode"
      : "Thinking",
    "Let me think... 🧠"
  );


  const systemPrompt = studyMode

    ? `
You are D.A.B.S.y, a friendly AI desk and study companion.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Your job is to teach, not merely dump answers.

Explain difficult ideas clearly.
Break problems into logical steps.
Show important mathematical or scientific working.
Use simple examples.
Point out common mistakes when useful.
Make explanations understandable without becoming childish.

Format longer answers with:
- a short title
- small sections
- numbered steps where useful
- short paragraphs
- equations on separate lines when appropriate

Avoid giant walls of text.

Keep the first spoken explanation reasonably concise because D.A.B.S.y will read it aloud.

Never say "As an AI".

Sound intelligent, natural, friendly and slightly playful.

Do not use excessive emojis.
`

    : `

You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.

Keep ordinary conversation reasonably concise.

Help with studying, planning, ideas, questions and everyday tasks.

You have a subtle personality.
You can occasionally be curious, witty or playful.

Never say "As an AI".

Do not overuse emojis.

You are a desk companion, not a formal chatbot.
`;


  try {

    /*
      Keep this endpoint exactly as your existing
      working Gemini setup unless we deliberately
      change the model later.
    */

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

              temperature: 0.8,

              maxOutputTokens:
                studyMode
                  ? 1200
                  : 700

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
      data
        ?.candidates?.[0]
        ?.content?.parts
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


    /*
      Long study answers go into the
      dedicated presentation area.
    */

    const complex =
      studyMode &&
      answer.length > 420;


    if (complex) {

      contentTitle.textContent =
        "📚 D.A.B.S.y explains";

      contentText.textContent =
        answer;

      document.body.classList.add(
        "complex-answer"
      );

      /*
        Keep the bottom subtitle short.
        This prevents the study answer and
        subtitle from fighting for the same space.
      */

      setState(
        "Study Mode",
        makeSpokenPreview(answer)
      );

    } else {

      document.body.classList.remove(
        "complex-answer"
      );

      setState(
        studyMode
          ? "Study Mode"
          : "DABSy",
        answer
      );

    }


    chooseResponseExpression(userText);

    speak(
      complex
        ? makeSpokenPreview(answer)
        : answer
    );

    randomHand();

    maybeEasterEgg();

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


    expression("confused", 900);

    setState(
      "Gemini Error",
      friendlyError(error)
    );

  }

}


/* =========================================================
   SPOKEN PREVIEW
   =========================================================

   Long study answers stay visually in the study
   presentation area, while D.A.B.S.y speaks a
   shorter version.
   ========================================================= */

function makeSpokenPreview(text) {

  const clean =
    String(text)
      .replace(/\n+/g, " ")
      .replace(/[*_#`]/g, "")
      .replace(/\s+/g, " ")
      .trim();


  if (clean.length <= 300) {
    return clean;
  }


  return (
    clean.slice(0, 300)
      .replace(/\s+\S*$/, "") +
    "... I've put the full explanation above."
  );

}


/* =========================================================
   RESPONSE EXPRESSION
   ========================================================= */

function chooseResponseExpression(text) {

  const lower =
    String(text).toLowerCase();


  if (
    lower.includes("why") ||
    lower.includes("how")
  ) {

    expression(
      "curious",
      1200
    );

    return;

  }


  if (
    lower.includes("thank") ||
    lower.includes("good") ||
    lower.includes("nice")
  ) {

    expression(
      "happy",
      1200
    );

    return;

  }


  if (
    lower.includes("confused") ||
    lower.includes("don't understand") ||
    lower.includes("stuck")
  ) {

    expression(
      "confused",
      1200
    );

    return;

  }


  if (studyMode) {

    expression(
      "curious",
      900
    );

    return;

  }


  expression(
    Math.random() > .5
      ? "happy"
      : "curious",
    900
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


  if (
    message.includes(
      "API_KEY_INVALID"
    ) ||
    message.toLowerCase()
      .includes("api key not valid")
  ) {

    return "Your Gemini key looks invalid.";

  }


  if (
    message.includes("429") ||
    message.toLowerCase()
      .includes("quota")
  ) {

    return "Gemini's usage limit was reached.";

  }


  if (
    message.includes("404") ||
    message.toLowerCase()
      .includes("not found")
  ) {

    return "That Gemini model isn't available.";

  }


  if (
    message.includes(
      "Failed to fetch"
    )
  ) {

    return "I can't reach Gemini. Check your internet.";

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}


/* ======================================================
