export const state = {

  listening: false,

  thinking: false,

  speaking: false,

  menuOpen: false,

  studyMode:
    localStorage.getItem("dabsy_study_mode") === "true",

  recognition: null,

  touchTimer: null

};


export function setState(title, text) {

  const status =
    document.getElementById("status");

  const speech =
    document.getElementById("speech");


  if (status) {
    status.textContent = title;
  }


  if (speech) {
    speech.textContent = text;
  }

}


export function setFlag(name, value) {

  state[name] = value;

}


export function updateStudyState() {

  document.body.classList.toggle(
    "study-mode",
    state.studyMode
  );

}
