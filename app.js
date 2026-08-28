const world = document.getElementById("dabsyWorld");
const face = document.getElementById("dabsyFace");
const speech = document.getElementById("speech");
const status = document.getElementById("status");

const bubbleMenu = document.getElementById("bubbleMenu");
const studyBubble = document.getElementById("studyBubble");
const settingsBubble = document.getElementById("settingsBubble");

const studyBadge = document.getElementById("studyBadge");

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

let studyMode =
localStorage.getItem("dabsy_study_mode") === "true";

let recognition = null;

/* =========================
BASIC UI
========================= */

function setState(title, text) {

status.textContent = title;
speech.textContent = text;

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

/* =========================
TOUCH
========================= */

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

  clearTimeout(touchTimer);  

  touchTimer = setTimeout(  
    startListening,  
    300  
  );  

}

);

world.addEventListener(
"pointerup",
() => {

clearTimeout(touchTimer);  

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

/* =========================
STUDY / SETTINGS MENU
========================= */

function setupMenu() {

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

settingsBubble.addEventListener(
"click",
event => {

event.stopPropagation();  

  closeMenu();  

  openSettings();  

}

);

}

/* =========================
SETTINGS
========================= */

function openSettings() {

const saved =
localStorage.getItem(
"dabsy_gemini_key"
) || "";

apiKeyInput.value = saved;

keyStatus.textContent =
saved
? "Gemini key saved on this device."
: "No Gemini key connected.";

settingsPanel.classList.add("open");

}

function closeSettingsPanel() {

settingsPanel.classList.remove("open");

}

function setupSettings() {

closeSettings.addEventListener(
"click",
closeSettingsPanel
);

settingsPanel.addEventListener(
"click",
event => {

if (event.target === settingsPanel) {  
    closeSettingsPanel();  
  }  

}

);

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
    "Gemini connected Ã¢Å“â€œ";  

  setTimeout(  
    () => {  

      closeSettingsPanel();  

      setState(  
        "Gemini Online",  
        "My brain is online. Ã°Å¸Â§ "  
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

/* =========================
SPEECH RECOGNITION
========================= */

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

world.classList.add(  
  "listening"  
);  

setState(  
  "Listening",  
  "I'm listening... Ã°Å¸â€˜â€š"  
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

  setState(  
    "Microphone",  
    "Microphone permission is blocked."  
  );  

} else if (  
  event.error === "no-speech"  
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

recognition.onend = () => {

listening = false;  

world.classList.remove(  
  "listening"  
);

};

}

/* =========================
LISTEN
========================= */

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

/* =========================
GEMINI
========================= */

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

world.classList.add(
"thinking"
);

setState(
studyMode
? "Study Mode"
: "Thinking",
"Let me think... Ã°Å¸Â§ "
);

const systemPrompt = studyMode

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
`

: `

You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.
Keep ordinary conversation concise.
You can joke lightly when appropriate.
Help with studying, planning, ideas and questions.
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
          temperature: .8,  
          maxOutputTokens: 900  
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

  contentTitle.textContent =  
    "Ã°Å¸â€œÅ¡ D.A.B.S.y explains";  

  contentText.textContent =  
    answer;  

  document.body.classList.add(  
    "complex-answer"  
  );  

} else {  

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


setState(  
  "Gemini Error",  
  friendlyError(error)  
);

}

}

/* =========================
ERROR HANDLING
========================= */

function friendlyError(error) {

const message =
String(
error?.message || ""
);

if (
message.includes(
"API_KEY_INVALID"
) ||
message.includes(
"invalid"
)
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

/* =========================
CUTE VOICE
========================= */

function speak(text) {

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
.98;

utterance.pitch =
1.15;

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

};

speechSynthesis.speak(
utterance
);

}

/* =========================
RANDOM HANDS
========================= */

function randomHand() {

if (
Math.random() > .25
) {

return;

}

const hand =
Math.random() > .5
? leftHand
: rightHand;

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

/* =========================
BLINKING
========================= */

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
3500

);

}

/* =========================
IDLE EYES
========================= */

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
    Math.random() > .5  
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

/* =========================
STARTUP
========================= */

function boot() {

updateStudyMode();

setState(
"DABSy Online",
"Hello! I'm DABSy. Tap & hold me. Ã°Å¸â€™â„¢"
);

setupTouch();
setupMenu();
setupSettings();
setupSpeech();
setupBlinking();
setupEyeMovement();

}

window.addEventListener(
"load",
boot
);
/* =========================
   PWA SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")
      .then(registration => {

        console.log(
          "D.A.B.S.y PWA ready:",
          registration.scope
        );

      })
      .catch(error => {

        console.error(
          "D.A.B.S.y PWA failed:",
          error
        );

      });

  });

}
