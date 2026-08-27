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

let listening = false;
let thinking = false;
let speaking = false;
let menuOpen = false;
let touchTimer = null;
let recognition = null;

let studyMode =
  localStorage.getItem("dabsy_study_mode") === "true";


/* =========================================
   UI
========================================= */

function setState(title, text) {
  if (status) status.textContent = title;
  if (speech) speech.textContent = text;
}


function updateStudyMode() {
  document.body.classList.toggle(
    "study-mode",
    studyMode
  );
}


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


/* =========================================
   TOUCH
========================================= */

function setupTouch() {

  world.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard") ||
        event.target.closest(".settings-card")
      ) {
        return;
      }

      clearTimeout(touchTimer);

      if (face) {
        face.classList.add("surprised");
      }

      touchTimer = setTimeout(
        () => {
          startListening();
        },
        300
      );

    }
  );


  world.addEventListener(
    "pointerup",
    () => {

      clearTimeout(touchTimer);

      if (face) {
        face.classList.remove("surprised");
      }

    }
  );


  world.addEventListener(
    "pointercancel",
    () => {

      clearTimeout(touchTimer);

      if (face) {
        face.classList.remove("surprised");
      }

    }
  );


  world.addEventListener(
    "dblclick",
    event => {

      if (
        event.target.closest(".bubble") ||
        event.target.closest(".settingsCard") ||
        event.target.closest(".settings-card")
      ) {
        return;
      }

      toggleMenu();

    }
  );

}


/* =========================================
   MENU
========================================= */

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

        document.body.classList.remove(
          "complex-answer"
        );


        if (studyMode) {

          setState(
            "Study Mode",
            "Study mode activated. What are we learning? 📚"
          );

          speak(
            "Study mode activated. What are we learning?"
          );

        } else {

          setState(
            "Normal Mode",
            "Back to normal. What's up? ✨"
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


/* =========================================
   SETTINGS
========================================= */

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


        setTimeout(
          () => {

            closeSettingsPanel();

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


  if (settingsPanel) {
    settingsPanel.classList.add("open");
  }

}


function closeSettingsPanel() {

  if (settingsPanel) {
    settingsPanel.classList.remove("open");
  }

}


/* =========================================
   SPEECH RECOGNITION
========================================= */

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

      setState(
        "Listening",
        "I'm listening... 👂"
      );

    };


  recognition.onresult =
    event => {

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


  recognition.onerror =
    event => {

      listening = false;

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


  recognition.onend =
    () => {

      listening = false;

      world.classList.remove(
        "listening"
      );

    };

}


/* =========================================
   START LISTENING
========================================= */

function startListening() {

  closeMenu();

  document.body.classList.remove(
    "complex-answer"
  );


  if (!recognition) {

    setState(
      "Voice unavailable",
      "Try opening D.A.B.S.y in Chrome on Android."
    );

    return;

  }


  if (listening) {

    recognition.stop();

    return;

  }


  try {

    recognition.start();

  }

  catch (error) {

    console.log(
      "Recognition start:",
      error
    );

  }

}


/* =========================================
   GEMINI
========================================= */

async function askDABSy(userText) {

  const apiKey =
    localStorage.getItem(
      "dabsy_gemini_key"
    );


  if (!apiKey) {

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

  document.body.classList.remove(
    "complex-answer"
  );

  world.classList.add(
    "thinking"
  );


  setState(
    studyMode
      ? "Study Mode"
      : "Thinking",
    "Let me think... 🧠"
  );


  const systemPrompt = studyMode

    ? `
You are D.A.B.S.y, a playful AI desk study companion.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Explain concepts clearly and simply.
Break difficult problems into logical steps.
Teach reasoning instead of only giving the final answer.
For maths and science, show important working.
Use short headings when useful.
Use numbered steps for procedures.
Keep explanations organized and readable.
Avoid huge walls of text.
Never say "As an AI".

Sound like a clever, friendly study buddy.
Be encouraging without being overly formal.
`

    : `
You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.

Keep ordinary conversation concise.

Use light humor when appropriate.

Help with studying, planning, ideas and questions.

Never say "As an AI".

Do not sound like a corporate chatbot.

You are a cute futuristic desk companion.
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


    /*
      Large answers get the
      premium study layout.
    */

    const isLong =
      answer.length > 420 ||
      answer.split("\n").length >= 7;


    const useStudyLayout =
      studyMode ||
      answer.length > 700;


    if (
      isLong &&
      useStudyLayout
    ) {

      showStudyPresentation(
        answer
      );

    }

    else {

      document.body.classList.remove(
        "complex-answer"
      );

    }


    setState(
      studyMode
        ? "Study Mode"
        : "DABSy",
      answer
    );


    speak(
      answer,
      isLong &&
      useStudyLayout
    );


    randomHand();

  }


  catch (error) {

    thinking = false;

    world.classList.remove(
      "thinking"
    );

    document.body.classList.remove(
      "complex-answer"
    );


    console.error(
      "DABSy Gemini error:",
      error
    );


    setState(
      "Gemini Error",
      friendlyError(error)
    );

  }

}


/* =========================================
   STUDY PRESENTATION
========================================= */

function showStudyPresentation(
  answer
) {

  document.body.classList.add(
    "complex-answer"
  );


  if (contentTitle) {

    contentTitle.textContent =
      studyMode
        ? "📚 D.A.B.S.y explains"
        : "✨ Here's the idea";

  }


  if (contentText) {

    contentText.innerHTML =
      createReadableLines(
        answer
      );

  }


  if (contentArea) {

    contentArea.scrollTop =
      0;

  }

}


/* =========================================
   READABLE LINES
========================================= */

function createReadableLines(
  text
) {

  const lines =
    text
      .split(/\n+/)
      .map(
        line =>
          line.trim()
      )
      .filter(
        line =>
          line.length > 0
      );


  const finalLines = [];


  lines.forEach(
    line => {

      if (
        line.length <= 180
      ) {

        finalLines.push(
          line
        );

        return;

      }


      const sentences =
        line.match(
          /[^.!?]+[.!?]+/g
        );


      if (sentences) {

        sentences.forEach(
          sentence => {

            const clean =
              sentence.trim();

            if (clean) {

              finalLines.push(
                clean
              );

            }

          }
        );

      }

      else {

        finalLines.push(
          line
        );

      }

    }
  );


  return finalLines
    .map(
      (line, index) => {

        return `
          <div
            class="dabsy-line"
            data-line="${index}"
          >
            <span class="line-pointer">
              ›
            </span>

            <span>
              ${escapeHTML(line)}
            </span>
          </div>
        `;

      }
    )
    .join("");

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
  text
) {

  return String(text)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================
   VOICE
========================================= */

function speak(
  text,
  trackStudy = false
) {

  if (
    !("speechSynthesis" in window)
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
        /en-GB/i.test(
          voice.lang
        )
    ) ||

    voices.find(
      voice =>
        /en-US/i.test(
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


  /*
    Slightly higher pitch
    gives a lighter/cuter feel.
  */

  utterance.rate =
    0.98;

  utterance.pitch =
    1.15;


  utterance.onstart =
    () => {

      speaking = true;

      world.classList.add(
        "speaking"
      );

    };


  utterance.onboundary =
    event => {

      if (
        !trackStudy ||
        !contentText
      ) {

        return;

      }


      const spoken =
        clean.substring(
          0,
          event.charIndex
        );


      const spokenLength =
        spoken.length;


      const lines =
        [
          ...document.querySelectorAll(
            ".dabsy-line"
          )
        ];


      if (!lines.length) {

        return;

      }


      let total = 0;

      let currentIndex = 0;


      for (
        let i = 0;
        i < lines.length;
        i++
      ) {

        const lineLength =
          lines[i]
            .innerText
            .replace(
              "›",
              ""
            )
            .trim()
            .length;


        total +=
          lineLength + 1;


        if (
          spokenLength <= total
        ) {

          currentIndex =
            i;

          break;

        }

      }


      highlightStudyLine(
        currentIndex
      );

    };


  utterance.onend =
    () => {

      speaking = false;

      world.classList.remove(
        "speaking"
      );

      clearStudyHighlight();

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

}


/* =========================================
   CURRENT READING LINE
========================================= */

function highlightStudyLine(
  index
) {

  const lines =
    document.querySelectorAll(
      ".dabsy-line"
    );


  lines.forEach(
    line =>
      line.classList.remove(
        "reading-now"
      )
  );


  const current =
    lines[index];


  if (!current) {

    return;

  }


  current.classList.add(
    "reading-now"
  );


  current.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


function clearStudyHighlight() {

  document
    .querySelectorAll(
      ".dabsy-line"
    )
    .forEach(
      line =>
        line.classList.remove(
          "reading-now"
        )
    );

}


/* =========================================
   OCCASIONAL HANDS
========================================= */

function randomHand() {

  /*
    30% chance.
    DABSy should NOT constantly
    have hands waving around.
  */

  if (
    Math.random() > 0.30
  ) {

    return;

  }


  const hand =
    Math.random() > 0.5
      ? leftHand
      : rightHand;


  if (!hand) {

    return;

  }


  hand.classList.add(
    "visible"
  );


  setTimeout(
    () => {

      hand.classList.remove(
        "visible"
      );

    },

    1000 +
    Math.random() * 900

  );

}


/* =========================================
   BLINKING
========================================= */

function setupBlinking() {

  setInterval(
    () => {

      if (
        listening ||
        thinking ||
        speaking
      ) {

        return;

      }


      face.classList.add(
        "blink"
      );


      setTimeout(
        () => {

          face.classList.remove(
            "blink"
          );

        },
        150
      );


    },

    3200 +
    Math.random() * 1800

  );

}


/* =========================================
   EYE MOVEMENT
========================================= */

function setupEyeMovement() {

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


      face.classList.add(
        direction
      );


      setTimeout(
        () => {

          face.classList.remove(
            direction
          );

        },
        650
      );


    },

    4500 +
    Math.random() * 3500

  );

}


/* =========================================
   IDLE PERSONALITY
========================================= */

function setupIdlePersonality() {

  setInterval(
    () => {

      if (
        listening ||
        thinking ||
        speaking ||
        menuOpen
      ) {

        return;

      }


      const roll =
      
