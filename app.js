const world = document.getElementById("dabsyWorld");
const face = document.getElementById("dabsyFace");
const faceGlow = document.getElementById("faceGlow");
const dialogue = document.getElementById("dialogue");
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

let apiKey = localStorage.getItem("dabsy_gemini_key") || "";
let studyMode = localStorage.getItem("dabsy_study_mode") === "true";
let listening = false;
let menuOpen = false;
let tapTimer = null;
let touchStart = null;
let rubbing = false;
let lastShakeTime = 0;
let lastX = null, lastY = null, lastZ = null;

document.addEventListener("DOMContentLoaded", startDABSy);

function startDABSy() {
  updateStudyMode();
  say("DABSy Online", "Hello Swagat. Tap me.");
  document.body.classList.add("first-open");
  setTimeout(() => { document.body.classList.remove("first-open"); }, 4500);

  setupTouch();
  setupShake();
  setupSpeech();
  setupSettings();
  startBlinking();
  startEyePersonality();
}

function say(statusText, speechText) {
  status.textContent = statusText;
  speech.textContent = speechText;
}

function blink() {
  face.classList.add("blink");
  setTimeout(() => { face.classList.remove("blink"); }, 160);
}

function startBlinking() {
  setInterval(() => {
    if (!listening && !document.body.classList.contains("dizzy")) {
      blink();
    }
  }, 3500);
}

function startEyePersonality() {
  setInterval(() => {
    if (listening || document.body.classList.contains("thinking") || document.body.classList.contains("dizzy")) return;
    const direction = Math.random() > .5 ? "look-left" : "look-right";
    face.classList.add(direction);
    setTimeout(() => { face.classList.remove(direction); }, 900);
  }, 6000);
}

function setupTouch() {
  world.addEventListener("pointerdown", onPointerDown, { passive: true });
  world.addEventListener("pointermove", onPointerMove, { passive: true });
  world.addEventListener("pointerup", onPointerUp, { passive: true });
  world.addEventListener("pointercancel", onPointerUp, { passive: true });
}

function onPointerDown(event) {
  if (event.target.closest(".bubble") || event.target.closest(".settings-card")) return;
  touchStart = { x: event.clientX, y: event.clientY, time: Date.now() };
  startPurring();
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    if (!rubbing) activateMicrophone();
  }, 280);
}

function onPointerMove(event) {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 12) {
    rubbing = true;
    clearTimeout(tapTimer);
    purrTick();
  }
}

function onPointerUp() {
  clearTimeout(tapTimer);
  if (rubbing) {
    stopPurring();
    rubbing = false;
  }
  touchStart = null;
}

let purrTimer = null;
let audioContext = null;
let purrOscillator = null;
let purrGain = null;

function startPurring() {
  if (purrTimer) return;
  purrTimer = setInterval(() => {
    if (navigator.vibrate) navigator.vibrate([8, 15, 8]);
  }, 170);
  world.classList.add("purring");
  createPurrSound();
}

function createPurrSound() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    purrOscillator = audioContext.createOscillator();
    purrGain = audioContext.createGain();
    purrOscillator.type = "sine";
    purrOscillator.frequency.value = 68;
    purrGain.gain.value = 0.025;
    purrOscillator.connect(purrGain);
    purrGain.connect(audioContext.destination);
    purrOscillator.start();
  } catch {}
}

function purrTick() {
  if (navigator.vibrate) navigator.vibrate(6);
}

function stopPurring() {
  clearInterval(purrTimer);
  purrTimer = null;
  world.classList.remove("purring");
  try {
    if (purrGain) purrGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + .08);
    if (purrOscillator) purrOscillator.stop(audioContext.currentTime + .1);
  } catch {}
}

world.addEventListener("dblclick", event => {
  if (event.target.closest(".bubble") || event.target.closest(".settings-card")) return;
  clearTimeout(tapTimer);
  stopPurring();
  rubbing = false;
  toggleBubbleMenu();
});

function toggleBubbleMenu() {
  menuOpen = !menuOpen;
  if (menuOpen) {
    world.classList.add("menu-open");
    bubbleMenu.setAttribute("aria-hidden", "false");
  } else {
    closeBubbleMenu();
  }
}

function closeBubbleMenu() {
  menuOpen = false;
  world.classList.remove("menu-open");
  bubbleMenu.setAttribute("aria-hidden", "true");
}

studyBubble.addEventListener("click", event => {
  event.stopPropagation();
  studyMode = !studyMode;
  localStorage.setItem("dabsy_study_mode", studyMode);
  updateStudyMode();
  closeBubbleMenu();
  if (studyMode) {
    say("Study Mode", "Okay. Let's study.");
    speak("Study mode activated. Let's study.");
  } else {
    say("Normal Mode", "Back to normal.");
  }
});

function updateStudyMode() {
  document.body.classList.toggle("study-mode", studyMode);
}

function setupSettings() {
  settingsBubble.addEventListener("click", event => {
    event.stopPropagation();
    closeBubbleMenu();
    openSettings();
  });
  closeSettings.addEventListener("click", closeSettingsPanel);
  settingsPanel.addEventListener("click", event => {
    if (event.target === settingsPanel) closeSettingsPanel();
  });
  saveKey.addEventListener("click", saveGeminiKey);
}

function openSettings() {
  apiKeyInput.value = apiKey;
  keyStatus.textContent = apiKey ? "A Gemini key is saved on this device." : "No Gemini key connected.";
  settingsPanel.classList.add("open");
}

function closeSettingsPanel() {
  settingsPanel.classList.remove("open");
}

function saveGeminiKey() {
  const value = apiKeyInput.value.trim();
  if (!value) {
    keyStatus.textContent = "Paste your Gemini API key first.";
    return;
  }
  apiKey = value;
  localStorage.setItem("dabsy_gemini_key", apiKey);
  keyStatus.textContent = "Gemini connected ✓";
  setTimeout(() => {
    closeSettingsPanel();
    say("Gemini Online", "My brain is online.");
  }, 700);
}

let recognition = null;
function setupSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { recognition = null; return; }
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    world.classList.add("listening");
    say("Listening", "I'm listening...");
  };

  recognition.onresult = event => {
    const text = event.results?.[0]?.[0]?.transcript?.trim();
    if (!text) { say("Listening", "I didn't catch that."); return; }
    askGemini(text);
  };

  recognition.onerror = event => {
    listening = false;
    world.classList.remove("listening");
    if (event.error === "not-allowed") {
      say("Microphone", "Microphone permission is blocked.");
    } else {
      say("Didn't catch that", "Try tapping me and speaking again.");
    }
  };

  recognition.onend = () => {
    listening = false;
    world.classList.remove("listening");
  };
}

function activateMicrophone() {
  closeBubbleMenu();
  if (!recognition) {
    say("Microphone unavailable", "This browser doesn't provide speech recognition.");
    return;
  }
  if (!apiKey) {
    say("Gemini Offline", "Double tap me and connect Gemini in Settings first.");
    return;
  }
  if (listening) { recognition.stop(); return; }
  try { recognition.start(); } catch (error) {}
}

async function askGemini(userText) {
  world.classList.add("thinking");
  say("Thinking", "Give me a second...");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `You are D.A.B.S.y. You are a friendly AI desk companion and study buddy. Personality: natural, intelligent, warm, slightly playful, concise. User is a Class 11 Science student in India. Current mode: ${studyMode ? "STUDY MODE" : "NORMAL MODE"}. Speak naturally. Do not begin with "As an AI". User said: ${userText}`
            }]
          },
          contents: [{ role: "user", parts: [{ text: userText }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || `Gemini error ${response.status}`);

    const answer = data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!answer) throw new Error("Gemini returned no answer.");

    world.classList.remove("thinking");
    world.classList.add("speaking");
    say(studyMode ? "Study Mode" : "DABSy", answer);
    speak(answer);
    setTimeout(() => { world.classList.remove("speaking"); }, 1000);
  } catch (error) {
    world.classList.remove("thinking");
    document.body.classList.add("error");
    say("Gemini Error", error.message || "Gemini couldn't respond.");
    setTimeout(() => { document.body.classList.remove("error"); }, 2500);
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const clean = String(text).replace(/[*_#`]/g, "");
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  utterance.onstart = () => { world.classList.add("speaking"); };
  utterance.onend = () => { world.classList.remove("speaking"); };
  speechSynthesis.speak(utterance);
}

function setupShake() {
  if (!("DeviceMotionEvent" in window)) return;
  window.addEventListener("devicemotion", event => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;
    const x = acceleration.x || 0, y = acceleration.y || 0, z = acceleration.z || 0;
    if (lastX === null) { lastX = x; lastY = y; lastZ = z; return; }
    const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
    lastX = x; lastY = y; lastZ = z;
    const now = Date.now();
    if (delta > 24 && now - lastShakeTime > 900) {
      lastShakeTime = now;
      dizzy();
    }
  }, { passive: true });
}

function dizzy() {
  if (listening || settingsPanel.classList.contains("open")) return;
  closeBubbleMenu();
  face.classList.add("dizzy");
  faceGlow.style.transform = "translate(-50%, -50%) scale(1.25)";
  say("🫨", "Woooah...");
  if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);
  setTimeout(() => {
    face.classList.remove("dizzy");
    faceGlow.style.transform = "translate(-50%, -50%)";
    say("DABSy", "Okay... I'm good.");
  }, 1300);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service worker:", error));
  });
}

