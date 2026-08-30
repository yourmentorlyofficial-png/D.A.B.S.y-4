import {
  state,
  setState
} from "./state.js";

import {
  speak
} from "./speech.js";

import {
  randomHand
} from "./face.js";


const GEMINI_MODEL = "gemini-3.6-flash";


const world =
  document.getElementById("dabsyWorld");

const contentTitle =
  document.getElementById("contentTitle");

const contentText =
  document.getElementById("contentText");


/* =========================
   GEMINI BRAIN
========================= */

export async function askDABSy(userText) {

  const apiKey =
    localStorage.getItem(
      "dabsy_gemini_key"
    );


  if (!apiKey) {

    setState(
      "Gemini Offline",
      "Connect Gemini in Settings first."
    );

    speak(
      "Please connect Gemini in Settings first."
    );

    return;

  }


  /* THINKING */

  state.thinking = true;

  world.classList.add(
    "thinking"
  );


  setState(
    state.studyMode
      ? "Study Mode"
      : "Thinking",
    "Let me think..."
  );


  const systemPrompt =
    state.studyMode

      ? `
You are D.A.B.S.y.

You are a smart, cute, slightly playful AI desk
and study companion.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Your job is to TEACH.

Explain concepts in a clear progression.

For maths and science:
1. State what is being asked.
2. Identify the important information.
3. Explain the idea or formula.
4. Work through the solution step by step.
5. Give the final answer clearly.
6. Add a tiny useful tip when appropriate.

Do not dump a huge wall of text.

Use short sections and readable paragraphs.

Do not use excessive emojis.

Your personality is:
smart,
warm,
cute,
calm,
playful,
sleek,
slightly cheeky.

Never say "As an AI".

Speak naturally because your answer may be read aloud.
`

      : `
You are D.A.B.S.y.

You are a smart AI desk companion living inside
the user's screen.

You are not a generic chatbot.

Be:
smart,
warm,
playful,
slightly cute,
natural,
sleek,
and occasionally cheeky.

Keep casual answers reasonably concise.

Help with:
studying,
questions,
ideas,
planning,
creative projects,
and everyday conversation.

Never say "As an AI".

Speak naturally.
`;


  try {

    const response =
      await fetch(

        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,

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
                      String(userText)
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
        ?.join("")
        ?.trim();


    if (!answer) {

      throw new Error(
        "Gemini returned no answer."
      );

    }


    /* =========================
       ANSWER RECEIVED
    ========================= */

    state.thinking =
      false;

    world.classList.remove(
      "thinking"
    );


    const isLong =
      answer.length > 450;


    /* =========================
       STUDY PRESENTATION
    ========================= */

    if (
      state.studyMode &&
      isLong
    ) {

      if (contentTitle) {

        contentTitle.textContent =
          "D.A.B.S.y explains";

      }


      if (contentText) {

        contentText.textContent =
          answer;

      }


      document.body.classList.add(
        "complex-answer"
      );

    }

    else {

      document.body.classList.remove(
        "complex-answer"
      );

    }


    /* =========================
       SUBTITLE
    ========================= */

    setState(

      state.studyMode
        ? "Study Mode"
        : "DABSy",

      answer

    );


    /* =========================
       SPEAK
    ========================= */

    speak(answer);


    /* =========================
       CHARACTER REACTION
    ========================= */

    try {

      if (
        typeof randomHand ===
        "function"
      ) {

        randomHand();

      }

    }

    catch (error) {

      console.log(
        "DABSy character reaction:",
        error
      );

    }


  }

  catch (error) {

    console.error(
      "DABSy Gemini:",
      error
    );


    state.thinking =
      false;

    world.classList.remove(
      "thinking"
    );


    document.body.classList.remove(
      "complex-answer"
    );


    setState(
      "Gemini Error",
      friendlyError(error)
    );

  }

}


/* =========================
   FRIENDLY ERRORS
========================= */

function friendlyError(error) {

  const message =
    String(
      error?.message || ""
    );


  const lower =
    message.toLowerCase();


  if (
    message ===
    "NO_API_KEY"
  ) {

    return (
      "Connect Gemini in Settings first."
    );

  }


  if (
    lower.includes(
      "api key"
    ) ||
    lower.includes(
      "api_key_invalid"
    ) ||
    lower.includes(
      "invalid argument"
    )
  ) {

    return (
      "Your Gemini API key looks invalid."
    );

  }


  if (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {

    return (
      "Gemini's usage limit was reached."
    );

  }


  if (
    message.includes("404") ||
    lower.includes("not found")
  ) {

    return (
      "Gemini 3.6 Flash isn't available for this key yet."
    );

  }


  if (
    lower.includes(
      "failed to fetch"
    )
  ) {

    return (
      "I can't reach Gemini. Check your internet connection."
    );

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}
