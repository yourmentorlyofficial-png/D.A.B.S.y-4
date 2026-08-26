alert("DABSy JS IS RUNNING");
const world = document.getElementById("dabsyWorld");
const face = document.getElementById("dabsyFace");
const faceGlow = document.getElementById("faceGlow");
const status = document.getElementById("status");
const speech = document.getElementById("speech");
const bubbleMenu = document.getElementById("bubbleMenu");
const studyBubble = document.getElementById("studyBubble");
const settingsBubble = document.getElementById("settingsBubble");
const studyBadge = document.getElementById("studyBadge");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKey = document.getElementById("saveKey");
const keyStatus = document.getElementById("keyStatus");
const hint = document.getElementById("hint");

let listening = false;
let thinking = false;
let speaking = false;
let studyMode = localStorage.getItem("dabsy_study_mode") === "true";
let menuOpen = false;
let recognition = null;
let touchTimer = null;
let touchStart = null;
let rubbing = false;

function setState(title, text) {
status.textContent = title;
speech.textContent = text;
}

function boot() {
updateStudyMode();
setState("DABSy Online", "Hello Swagat. Tap me to talk.");
setupSpeech();
setupTouch();
setupSettings();
setupMenu();
setupBlinking();
setupEyeMovement();
registerServiceWorker();

setTimeout(() => {
setState("DABSy", "How can I help you today?");
}, 3000);
}

function setupTouch() {
world.addEventListener("pointerdown", e => {
if (
e.target.closest(".bubble") ||
e.target.closest(".settings-card")
) return;

touchStart = {  
  x: e.clientX,  
  y: e.clientY  
};  

rubbing = false;  

clearTimeout(touchTimer);  

touchTimer = setTimeout(() => {  
  if (!rubbing) {  
    startListening();  
  }  
}, 350);

});

world.addEventListener("pointermove", e => {
if (!touchStart) return;

const dx = e.clientX - touchStart.x;  
const dy = e.clientY - touchStart.y;  

if (Math.sqrt(dx * dx + dy * dy) > 15) {  
  rubbing = true;  
  clearTimeout(touchTimer);  
}

});

world.addEventListener("pointerup", () => {
clearTimeout(touchTimer);
touchStart = null;
rubbing = false;
});

world.addEventListener("dblclick", e => {
if (
e.target.closest(".bubble") ||
e.target.closest(".settings-card")
) return;

toggleMenu();

});
}

function setupMenu() {
studyBubble.addEventListener("click", e => {
e.stopPropagation();

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

});

settingsBubble.addEventListener("click", e => {
e.stopPropagation();
closeMenu();
openSettings();
});
}

function toggleMenu() {
menuOpen = !menuOpen;

if (menuOpen) {
world.classList.add("menu-open");
bubbleMenu.setAttribute("aria-hidden", "false");
} else {
closeMenu();
}
}

function closeMenu() {
menuOpen = false;
world.classList.remove("menu-open");
bubbleMenu.setAttribute("aria-hidden", "true");
}

function updateStudyMode() {
document.body.classList.toggle(
"study-mode",
studyMode
);
}

function setupSettings() {
closeSettings.addEventListener(
"click",
closeSettingsPanel
);

settingsPanel.addEventListener("click", e => {
if (e.target === settingsPanel) {
closeSettingsPanel();
}
});

saveKey.addEventListener("click", () => {
const key = apiKeyInput.value.trim();

if (!key) {  
  keyStatus.textContent =  
    "Enter your Gemini API key.";  
  return;  
}  

/*  
  TEMPORARY LOCAL TEST MODE.  

  This lets the frontend talk to Gemini while we  
  finish the Worker version.  

  DO NOT publish this version publicly with your  
  personal API key.  
*/  

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

  speak("My brain is online.");  
}, 600);

});
}

function openSettings() {
const saved =
localStorage.getItem("dabsy_gemini_key") || "";

apiKeyInput.value = saved;

keyStatus.textContent = saved
? "A Gemini key is saved on this device."
: "No Gemini key connected.";

settingsPanel.classList.add("open");
}

function closeSettingsPanel() {
settingsPanel.classList.remove("open");
}

function setupSpeech() {
const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if (!SpeechRecognition) {
recognition = null;
return;
}

recognition = new SpeechRecognition();

recognition.lang = "en-IN";
recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onstart = () => {
listening = true;

world.classList.add("listening");  

setState(  
  "Listening",  
  "I'm listening..."  
);

};

recognition.onresult = event => {
const result =
event.results?.[0]?.[0]?.transcript;

const text =  
  result ? result.trim() : "";  

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

world.classList.remove("listening");  

if (event.error === "not-allowed") {  
  setState(  
    "Microphone",  
    "Microphone permission is blocked."  
  );  
} else if (event.error === "no-speech") {  
  setState(  
    "Listening",  
    "I didn't hear anything."  
  );  
} else {  
  setState(  
    "Microphone",  
    "Something went wrong. Try again."  
  );  
}

};

recognition.onend = () => {
listening = false;

world.classList.remove("listening");

};
}

function startListening() {
closeMenu();

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
} catch (error) {
console.log(error);
}
}

async function askDABSy(userText) {
const apiKey =
localStorage.getItem("dabsy_gemini_key");

if (!apiKey) {
setState(
"Gemini Offline",
"Double tap me, open Settings, and connect Gemini."
);

speak(  
  "Please connect Gemini in Settings first."  
);  

return;

}

thinking = true;

world.classList.add("thinking");

setState(
studyMode ? "Study Mode" : "Thinking",
"Give me a second..."
);

const systemPrompt = studyMode
? `
You are D.A.B.S.y, an intelligent AI desk study buddy.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Your job is to:

explain concepts clearly

break difficult problems into small steps

use simple language

help the student understand instead of blindly giving answers

use examples when useful

stay concise enough to listen to

never say "As an AI"

sound natural and friendly
  :
You are D.A.B.S.y, a friendly AI desk companion.


The user is a Class 11 Science student in India.

You are currently in NORMAL MODE.

Be:

intelligent

warm

natural

concise

slightly playful


Talk like a helpful desk companion.

Never begin with "As an AI".
`;

try {
const response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
{
method: "POST",

headers: {  
      "Content-Type": "application/json",  
      "x-goog-api-key": apiKey  
    },  

    body: JSON.stringify({  
      systemInstruction: {  
        parts: [  
          {  
            text: systemPrompt  
          }  
        ]  
      },  

      contents: [  
        {  
          role: "user",  

          parts: [  
            {  
              text: userText  
            }  
          ]  
        }  
      ],  

      generationConfig: {  
        temperature: 0.7,  
        maxOutputTokens: 700  
      }  
    })  
  }  
);  

const data = await response.json();  

if (!response.ok) {  
  throw new Error(  
    data?.error?.message ||  
    `Gemini error ${response.status}`  
  );  
}  

const answer =  
  data?.candidates?.[0]?.content?.parts  
    ?.map(part => part.text || "")  
    .join("")  
    .trim();  

if (!answer) {  
  throw new Error(  
    "Gemini returned an empty answer."  
  );  
}  

thinking = false;  

world.classList.remove("thinking");  

world.classList.add("speaking");  

setState(  
  studyMode ? "Study Mode" : "DABSy",  
  answer  
);  

speak(answer);

} catch (error) {
thinking = false;

world.classList.remove("thinking");  

document.body.classList.add("error");  

console.error(  
  "DABSy Gemini error:",  
  error  
);  

setState(  
  "Gemini Error",  
  friendlyError(error)  
);  

setTimeout(() => {  
  document.body.classList.remove("error");  
}, 3500);

}
}

function friendlyError(error) {
const message =
String(error?.message || "");

if (
message.includes("API_KEY_INVALID") ||
message.includes("invalid")
) {
return "The Gemini key looks invalid.";
}

if (
message.includes("quota") ||
message.includes("429")
) {
return "Gemini's usage limit was reached.";
}

if (
message.includes("404") ||
message.includes("not found")
) {
return "The Gemini model isn't available.";
}

if (
message.includes("Failed to fetch")
) {
return "I can't reach Gemini. Check your internet.";
}

return message ||
"Gemini couldn't respond. Try again.";
}

function speak(text) {
if (!("speechSynthesis" in window)) {
return;
}

speechSynthesis.cancel();

const clean =
String(text)
.replace(/[*_#`]/g, "")
.replace(/\n+/g, ". ");

const utterance =
new SpeechSynthesisUtterance(clean);

utterance.lang = "en-IN";
utterance.rate = 1.02;
utterance.pitch = 1;

utterance.onstart = () => {
speaking = true;
world.classList.add("speaking");
};

utterance.onend = () => {
speaking = false;
world.classList.remove("speaking");
};

speechSynthesis.speak(utterance);
}

function setupBlinking() {
setInterval(() => {
if (
!listening &&
!thinking &&
!speaking
) {
face.classList.add("blink");

setTimeout(() => {  
    face.classList.remove("blink");  
  }, 160);  
}

}, 3500);
}

function setupEyeMovement() {
setInterval(() => {
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

face.classList.add(direction);  

setTimeout(() => {  
  face.classList.remove(direction);  
}, 900);

}, 6000);
}

function registerServiceWorker() {
if ("serviceWorker" in navigator) {
window.addEventListener(
"load",
() => {
navigator.serviceWorker
.register("./sw.js")
.catch(error => {
console.warn(
"Service worker error:",
error
);
});
}
);
}
}

window.addEventListener(
"load",
boot
);
