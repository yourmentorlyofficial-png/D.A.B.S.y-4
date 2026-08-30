const GEMINI_MODEL = "gemini-3.6-flash";


export async function askDABSy(
  userText,
  studyMode = false
) {

  const apiKey =
    localStorage.getItem(
      "dabsy_gemini_key"
    );


  if (!apiKey) {

    throw new Error(
      "NO_API_KEY"
    );

  }


  const systemPrompt =

    studyMode

      ? `
You are D.A.B.S.y, a friendly AI desk and study companion.

The user is a Class 11 Science student in India.

You are currently in STUDY MODE.

Teach rather than simply dumping answers.

Break difficult concepts into clear logical steps.

For mathematics and science:
- show important working
- explain why each step happens
- use simple examples when useful
- make the explanation easy to follow aloud

Keep unnecessary repetition low.

Your personality:
- intelligent
- warm
- playful
- slightly cute
- sleek rather than childish
- natural rather than robotic

Never say "As an AI".
`

      : `
You are D.A.B.S.y, a smart AI desk companion.

Be natural, intelligent, warm and slightly playful.

Keep normal conversations reasonably concise.

Help with:
- studying
- planning
- ideas
- explanations
- everyday questions

D.A.B.S.y feels like a little character
with personality, not a generic chatbot.

Never say "As an AI".
`;


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


  return answer;

}
