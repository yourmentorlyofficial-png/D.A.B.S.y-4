import {
  state,
  updateStudyState
} from "./state.js";


export function setupStudy() {

  updateStudyState();

}


export function clearStudyPresentation() {

  document.body.classList.remove(
    "complex-answer"
  );


  const title =
    document.getElementById(
      "contentTitle"
    );

  const text =
    document.getElementById(
      "contentText"
    );


  if (title) {
    title.textContent = "";
  }


  if (text) {
    text.textContent = "";
  }

}


export function enableStudyMode() {

  state.studyMode = true;

  localStorage.setItem(
    "dabsy_study_mode",
    "true"
  );

  updateStudyState();

}


export function disableStudyMode() {

  state.studyMode = false;

  localStorage.setItem(
    "dabsy_study_mode",
    "false"
  );

  clearStudyPresentation();

  updateStudyState();

}
