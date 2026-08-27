/* =========================================================
   D.A.B.S.y
   SAFE PREMIUM CORE
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     ELEMENTS
  ======================================================= */

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

  const contentTitle = $("contentTitle");
  const contentText = $("contentText");

  const leftHand = $("leftHand");
  const rightHand = $("rightHand");

  /* =======================================================
     STATE
     ======================================================= */

  let listening = false;
  let thinking = false;
  let speaking = false;
  let menuOpen = false;

  let holdTimer = null;
  let pointerDown = false;
  let recognition = null;

  let studyMode =
    localStorage.getItem("dabsy_study_mode") === "true";

  /* =======================================================
     SAFE HELPERS
     ======================================================= */

  function safeClass(action, className) {
    if (!world) return;

    try {
      world.classList[action](className);
    } catch (_) {}
  }

  function safeBodyClass(action, className) {
    try {
      document.body.classList[action](className);
    } catch (_) {}
  }

  function setState(title, text) {

    if (status) {
      status.textContent = String(title || "");
    }

    if (speech) {
      speech.textContent = String(text || "");
    }

  }

  /* =======================================================
     STUDY MODE
     ======================================================= */

  function updateStudyMode() {

    safeBodyClass(
      "toggle",
      "study-mode"
    );

    if (document.body) {
      document.body.classList.toggle(
        "study-mode",
        studyMode
      );
    }

  }

  /* =======================================================
     MENU
     ======================================================= */

  function closeMenu() {

    menuOpen = false;

    safeClass(
      "remove",
      "menu-open"
    );

    if (bubbleMenu) {
      bubbleMenu.setAttribute(
        "aria-hidden",
        "true"
      );
    }

  }

  function toggleMenu() {

    menuOpen = !menuOpen;

    if (world) {
      world.classList.toggle(
        "menu-open",
        menuOpen
      );
    }

    if (bubbleMenu) {
      bubbleMenu.setAttribute(
        "aria-hidden",
        String(!menuOpen)
      );
    }

  }

  /* =======================================================
     TOUCH / HOLD
     ======================================================= */

  function cancelHold() {

    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

  }

  function setupTouch() {

    if (!world) {
      console.error(
        "DABSy: #dabsyWorld missing."
      );
      return;
    }

    world.addEventListener(
      "pointerdown",
      event => {

        if (
          event.target.closest(".bubble") ||
          event.target.closest(".settingsCard")
        ) {
          return;
        }

        pointerDown = true;

        cancelHold();

        holdTimer = setTimeout(() => {

          if (!pointerDown) return;

          startListening();

        }, 320);

      },
      { passive: true }
    );


    world.addEventListener(
      "pointerup",
      () => {

        pointerDown = false;

        cancelHold();

      },
      { passive: true }
    );


    world.addEventListener(
      "pointercancel",
      () => {

        pointerDown = false;

        cancelHold();

      },
      { passive: true }
    );


    world.addEventListener(
      "pointerleave",
      () => {

        pointerDown = false;

        cancelHold();

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

  /* =======================================================
     MENU BUTTONS
     ======================================================= */

  function setupMenu() {

    if (studyBubble) {

      studyBubble.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          studyMode = !studyMode;

          try {
            localStorage.setItem(
              "dabsy_study_mode",
              String(studyMode)
            );
          } catch (_) {}

          updateStudyMode();

          closeMenu();

          if (studyMode) {

            setState(
              "Study Mode",
              "Study mode activated. What are we learning?"
            );

            speak(
              "Study mode activated. What are we learning?"
            );

          } else {

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

  /* =======================================================
     SETTINGS
     ======================================================= */

  function openSettings() {

    if (!settingsPanel) return;

    let saved = "";

    try {
      saved =
        localStorage.getItem(
          "dabsy_gemini_key"
        ) || "";
    } catch (_) {}

    if (apiKeyInput) {
      apiKeyInput.value = saved;
    }

    if (keyStatus) {

      keyStatus.textContent =
        saved
          ? "Gemini key saved on this device."
          : "No Gemini key connected.";

    }

    settingsPanel.classList.add(
      "open"
    );

  }


  function closeSettingsPanel() {

    if (!settingsPanel) return;

    settingsPanel.classList.remove(
      "open"
    );

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
            apiKeyInput?.value.trim() || "";

          if (!key) {

            if (keyStatus) {
              keyStatus.textContent =
                "Please enter your Gemini API key.";
            }

            return;

          }

          try {

            localStorage.setItem(
              "dabsy_gemini_key",
              key
            );

          } catch (_) {

            if (keyStatus) {
              keyStatus.textContent =
                "I couldn't save the key on this device.";
            }

            return;

          }

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
            400
          );

        }
      );

    }

  }

  /* =======================================================
     SPEECH RECOGNITION
     ======================================================= */

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


      recognition.onstart = () => {

        listening = true;

        safeClass(
          "add",
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
            event.results?.[0]?.[0]?.transcript ||
            "";

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

          safeClass(
            "remove",
            "listening"
          );

          if (
            event.error ===
            "not-allowed"
          ) {

            setState(
              "Microphone",
              "Microphone permission is blocked."
            );

          } else if (
            event.error ===
            "no-speech"
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

          safeClass(
            "remove",
            "listening"
          );

        };

    } catch (error) {

      console.error(
        "DABSy speech setup:",
        error
      );

      recognition = null;

    }

  }

  /* =======================================================
     START LISTENING
     ======================================================= */

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
      } catch (_) {}

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

  /* =======================================================
     GET GEMINI KEY
     ======================================================= */

  function getApiKey() {

    try {

      return (
        localStorage.getItem(
          "dabsy_gemini_key"
        ) || ""
      );

    } catch (_) {

      return "";

    }

  }

  /* =======================================================
     GEMINI
     ======================================================= */

  async function askDABSy(userText) {

    const apiKey =
      getApiKey();

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

    safeClass(
      "add",
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

Explain clearly and simply.
Break difficult problems into logical steps.
Teach the reasoning instead of only giving the final answer.
Use examples when useful.
For maths and science, show important working.
Keep spoken answers reasonably concise.
Never say "As an AI".
Sound natural, friendly and slightly playful.
`

        : `
You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.
Keep ordinary conversation concise.
Help with studying, planning, ideas and questions.
Never say "As an AI".
Sound like a smart little desk companion.
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

      safeClass(
        "remove",
        "thinking"
      );


      const complex =
        studyMode &&
        answer.length > 450;


      if (
        complex &&
        contentTitle &&
        contentText
      ) {

        contentTitle.textContent =
          "📚 D.A.B.S.y explains";

        contentText.textContent =
          answer;

        safeBodyClass(
          "add",
          "complex-answer"
        );

      } else {

        safeBodyClass(
          "remove",
          "complex-answer"
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

      safeClass(
        "remove",
        "thinking"
      );

      safeBodyClass(
        "remove",
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

  /* =======================================================
     ERROR MESSAGE
     ======================================================= */

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
        "api key"
      ) &&
      lower.includes(
        "invalid"
      )
    ) {

      return "Your Gemini key looks invalid.";

    }


    if (
      lower.includes("429") ||
      lower.includes("quota")
    ) {

      return "Gemini's usage limit was reached.";

    }


    if (
      lower.includes("404") ||
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

  /* =======================================================
     VOICE
     ======================================================= */

  function speak(text) {

    if (
      !("speechSynthesis" in window)
    ) {

      return;

    }

    try {

      speechSynthesis.cancel();

      const clean =
        String(text || "")
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
        1.15;


      utterance.onstart =
        () => {

          speaking = true;

          safeClass(
            "add",
            "speaking"
          );

        };


      utterance.onend =
        () => {

          speaking = false;

          safeClass(
            "remove",
            "speaking"
          );

        };


      utterance.onerror =
        () => {

          speaking = false;

          safeClass(
            "remove",
            "speaking"
          );

        };


      speechSynthesis.speak(
        utterance
      );

    } catch (error) {

      console.error(
        "DABSy voice:",
        error
      );

    }

  }

  /* =======================================================
     HAND ANIMATION
     ======================================================= */

  function randomHand() {

    const hand =
      Math.random() > 0.5
        ? leftHand
        : rightHand;

    if (!hand) return;

    if (
      Math.random() > 0.35
    ) {
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
      1100
    );

  }

  /* =======================================================
     BLINK
     ======================================================= */

  function setupBlinking() {

    if (!face) return;

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
      3500
    );

  }

  /* =======================================================
     IDLE EYES
     ======================================================= */

  function setupEyeMovement() {

    if (!face) return;

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
          700
        );

      },
      5500
    );

  }

  /* =====================
