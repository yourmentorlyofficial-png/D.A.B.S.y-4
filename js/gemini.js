/* =========================================
   D.A.B.S.y GEMINI BRAIN
   Gemini 3.6 Flash
========================================= */

const GEMINI_MODEL = "gemini-3.6-flash";

async function askGemini(userText, studyMode = false) {

  const apiKey =
    localStorage.getItem("dabsy_gemini_key");

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const systemPrompt = studyMode
    ? `
You are D.A.B.S.y, a friendly AI desk and study companion.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Teach the user instead of simply dumping the answer.

Rules:
- Explain difficult concepts step by step.
- Show important working for mathematics and science.
- Use simple examples when useful.
- Keep explanations understandable when spoken aloud.
- Avoid unnecessary repetition.
- Give the answer clearly before adding extra detail when appropriate.
- Be accurate.
- If the user asks something ambiguous, ask a short clarification.

Personality:
- intelligent
- warm
- playful
- slightly cute
- sleek
- natural
- never overly childish

Never say "As an AI".
You are D.A.B.S.y, their desk study companion.
`

    : `
You are D.A.B.S.y, a smart AI desk companion.

Be:
- intelligent
- natural
- warm
- playful
- slightly cute
- sleek
- concise when the question is simple

Help with:
- studying
- explanations
- planning
- ideas
- everyday questions
- problem solving

D.A.B.S.y should feel like a little character with personality,
not a generic chatbot.

Use light humor when it fits naturally.
Do not overdo it.

Never say "As an AI".
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      GEMINI_MODEL +
      ":generateContent",
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
                text: String(userText)
              }
            ]
          }
        ],

        generationConfig: {
          maxOutputTokens: 900
        }

      })
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Gemini returned an unreadable response."
    );
  }

  if (!response.ok) {

    throw new Error(
      data?.error?.message ||
      `Gemini error ${response.status}`
    );

  }

  const answer =
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part?.text || "")
      .join("")
      .trim();

  if (!answer) {

    throw new Error(
      "Gemini returned no answer."
    );

  }

  return answer;
}


/* =========================================
   ERROR HANDLING
========================================= */

function friendlyGeminiError(error) {

  const message =
    String(error?.message || "");

  const lower =
    message.toLowerCase();

  if (
    error?.message === "NO_API_KEY"
  ) {
    return "Gemini isn't connected yet.";
  }

  if (
    lower.includes("api key") &&
    (
      lower.includes("invalid") ||
      lower.includes("not valid")
    )
  ) {
    return "That Gemini key looks invalid.";
  }

  if (
    message.includes("401") ||
    message.includes("403")
  ) {
    return "Gemini rejected the API key.";
  }

  if (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {
    return "Gemini's usage limit was reached.";
  }

  if (
    message.includes("404") ||
    lower.includes("not found")
  ) {
    return "Gemini 3.6 Flash isn't available for this request.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network")
  ) {
    return "I can't reach Gemini. Check your internet connection.";
  }

  return (
    message ||
    "Gemini couldn't respond. Try again."
  );
}
