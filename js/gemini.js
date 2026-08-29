import {
  state,
  setState
} from "./state.js";

import {
  speak
} from "./speech.js";


const world =
  document.getElementById("dabsyWorld");

const contentTitle =
  document.getElementById("contentTitle");

const contentText =
  document.getElementById("contentText");


export async function askDABSy(userText) {

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
You are D.A.B.S.y, a friendly AI desk study companion.

The user is a Class 11 Science student in India.

You are in STUDY MODE.

Explain concepts clearly and simply.

Break difficult problems into logical steps.

Teach the reasoning instead of only giving the final answer.

For mathematics and science, show useful working.

Use headings and short sections when helpful.

Avoid huge walls of text.

Keep the spoken answer concise because D.A.B.S.y will read it aloud.

Never say "As an AI".

Sound natural, intelligent, friendly and slightly playful.
`

      : `
You are D.A.B.S.y, a friendly AI desk companion.

Be intelligent, warm, playful and natural.

Keep normal conversation reasonably concise.

Help with studying, planning, ideas and questions.

Never say "As an AI".

You are a desk companion, not a formal chatbot.
`;


  try {

    const response =
      await fetch(

        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

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

                temperature: 0.8,

                maxOutputTokens:
                  state.studyMode
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


    state.thinking = false;

    world.classList.remove(
      "thinking"
    );


    const complex =
      state.studyMode &&
      answer.length > 450;


    if (complex) {

      contentTitle.textContent =
        "📚 D.A.B.S.y explains";

      contentText.textContent =
        answer;

      document.body.classList.add(
        "complex-answer"
      );

    }

    else {

      document.body.classList.remove(
        "complex-answer"
      );

      contentTitle.textContent =
        "";

      contentText.textContent =
        "";

    }


    setState(
      state.studyMode
        ? "Study Mode"
        : "DABSy",

      answer
    );


    speak(answer);


  }

  catch (error) {

    state.thinking = false;

    world.classList.remove(
      "thinking"
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


function friendlyError(error) {

  const message =
    String(
      error?.message || ""
    );


  const lower =
    message.toLowerCase();


  if (
    lower.includes("api key") ||
    lower.includes("api_key") ||
    lower.includes("invalid")
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

    return "The Gemini model isn't available.";

  }


  if (
    lower.includes("failed to fetch")
  ) {

    return "I can't reach Gemini. Check your internet.";

  }


  return (
    message ||
    "Gemini couldn't respond. Try again."
  );

}
