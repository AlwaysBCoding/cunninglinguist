import { LanguageSetting } from '../types/Language';
import { QuizQuestionType, QuizQuestion } from '../types/Quiz';

export const generateTransliterationQuestion = async (
  sourceLanguage: LanguageSetting,
  targetLanguage: LanguageSetting
): Promise<QuizQuestion> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: "system", content: `Generate a simple vocabulary word in ${sourceLanguage.display}, along with its transliteration and spelling in ${targetLanguage.display}.` },
        { role: "user", content: `Provide a common ${sourceLanguage.display} noun, its ${targetLanguage.display} transliteration (Latin script), and its ${targetLanguage.display} spelling (native script).` }
      ],
      functions: [
        {
          name: "generate_transliteration_question",
          description: "Generates a simple vocabulary word, its transliteration, and native script spelling.",
          parameters: {
            type: "object",
            properties: {
              sourceWord: { type: "string", description: "The word in the source language." },
              transliteration: { type: "string", description: "The word transliterated into Latin script." },
              targetWord: { type: "string", description: "The word written in the target language's native script." }
            },
            required: ["sourceWord", "transliteration", "targetWord"]
          }
        }
      ],
      function_call: { name: 'generate_transliteration_question' }
    })
  });

  const data = await response.json();
  const functionResponse = data.choices?.[0]?.message?.function_call?.arguments;

  if (!functionResponse) {
    console.error("Invalid response from OpenAI", data);
    return {
      type: QuizQuestionType.TRANSLATE_TO_TARGET,
      prompt: `Write the Hindi script for the word: apple | seb`,
      correctAnswers: ["सेब"]
    };
  }

  const parsedResponse = JSON.parse(functionResponse);
  const { sourceWord, transliteration, targetWord } = parsedResponse;

  return {
    type: QuizQuestionType.TRANSLATE_TO_TARGET,
    prompt: `Write the ${targetLanguage.display} script for the word: ${sourceWord} | ${transliteration}`,
    correctAnswers: [targetWord]
  };
}
