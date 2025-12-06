import { LanguageSetting } from '../types/Language';
import { VerbConjugation, SentenceAnalysis } from '../types/Cryptex';
import { NPCObjective, DynamicNPC } from '../types/NPC';

export const fetchAIResponse = async (
  npc: DynamicNPC,
  conversationHistory: { role: string; text: string }[],
  areaPrompt: string,
  npcLanguage: string
) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: 'system', content: `You must respond in ${npcLanguage}`},
          { role: 'system', content: areaPrompt},
          { role: 'system', content: npc.aiIdentity },
          ...conversationHistory.map((entry) => ({
            role: entry.role === "player" ? "user" : "assistant",
            content: entry.text,
          })),
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "(No response)";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "(Error retrieving response)";
  }
}

export const fetchCryptexAnalysis = async (
  sentence: string,
  targetLanguage: string
): Promise<SentenceAnalysis | null> => {
  const SYSTEM_PROMPT = `
    You are a linguistics AI that analyzes sentences in ${targetLanguage} for educational purposes.
    You MUST return a structured JSON response **exactly matching** the given TypeScript schema.

    DO NOT omit any fields.
    DO NOT return missing or partial data.
    If no idioms or phrases exist, return an empty array for "expressions".
    If a word has no grammatical attributes, return an empty object for "grammar".

    Your JSON response **must include**:
    1. **Word-level breakdown** (root form, part of speech, grammar, definition).
    2. **Multi-word expressions** (idioms, named entities, phrasal verbs).
    3. **Sentence structure analysis** (subject, verb, object, tense).

    **DO NOT RETURN ANY TEXT EXPLANATIONS—ONLY JSON.**`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          { role: 'user', content: `Analyze this sentence: ${sentence}` }
        ],
        functions: [
          {
            name: "analyze_sentence",
            description: "Returns a structured linguistic breakdown of a single sentence.",
            parameters: {
              type: "object",
              properties: {
                sourceSentence: { type: "string" },
                translatedSentence: { type: "string" },
                words: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      baseForm: { type: "string" },
                      partOfSpeech: { type: "string", enum: ["noun", "proper_noun", "pronoun", "verb", "modal_verb", "auxiliary_verb", "adjective", "adverb", "preposition", "conjunction", "determiner", "article", "interjection", "numeral"] },
                      definition: { type: "string" },
                      transliteration: { type: "string" },
                      grammar: {
                        type: "object",
                        properties: {
                          tense: { type: "string", enum: ["present", "past", "future", "imperfect", "preterite", "present_perfect", "past_perfect", "future_perfect", "conditional_perfect", "present_continuous", "past_continuous", "future_continuous", "conditional_continuous", "present_subjunctive", "past_subjunctive", "future_subjunctive", "imperative_affirmative", "imperative_negative", "conditional", "potential", "obligatory", "hypothetical"], nullable: true },
                          person: { type: "string", enum: ["first", "second", "third"], nullable: true },
                          number: { type: "string", enum: ["one", "two", "few", "many", "other"], nullable: true },
                          mood: { type: "string", enum: ["indicative", "subjunctive", "imperative"], nullable: true },
                          subject: { type: "boolean", nullable: true },
                          object: { type: "boolean", nullable: true },
                          gender: { type: "string", enum: ["masculine", "feminine", "neutral"], nullable: true }
                        }
                      }
                    }
                  }
                },
                expressions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phrase: { type: "string" },
                      type: { type: "string", enum: ["idiom", "phrasal_verb", "named_entity", "collocation"] },
                      definition: { type: "string" },
                      transliteration: { type: "string" }
                    }
                  }
                },
                sentenceStructure: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    verb: { type: "string" },
                    object: { type: "string", nullable: true },
                    tense: { type: "string", enum: ["present", "past", "future", "imperfect", "preterite", "present_perfect", "past_perfect", "future_perfect", "conditional_perfect", "present_continuous", "past_continuous", "future_continuous", "conditional_continuous", "present_subjunctive", "past_subjunctive", "future_subjunctive", "imperative_affirmative", "imperative_negative", "conditional", "potential", "obligatory", "hypothetical"] }
                  }
                }
              },
              required: ["sourceSentence", "translatedSentence", "words", "sentenceStructure"]
            }
          }
        ],
        function_call: 'auto'
      })
    });

    const data = await response.json();
    const rawArguments = data.choices?.[0]?.message?.function_call?.arguments;
    const parsedArguments = rawArguments ? JSON.parse(rawArguments) : null;
    return parsedArguments as SentenceAnalysis | null;
  } catch (error) {
    console.error('Error fetching cryptex analysis', error);
    return null;
  }
}

export const fetchVerbConjugations = async (
  verb: string,
  language: LanguageSetting
) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: "system", content: `You are a linguistics AI specializing in verb conjugations for ${language.display}.` },
          { role: "user", content: `Provide a full conjugation table for the verb "${verb}".` }
        ],
        functions: [
          {
            name: "get_verb_conjugation",
            description: "Returns a structured conjugation table for a given verb.",
            parameters: {
              type: "object",
              properties: {
                baseForm: { type: "string" },
                language: { type: "string" },
                conjugations: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        singular: { type: "string" },
                        plural: { type: "string" }
                      }
                    }
                  }
                }
              },
              required: ["baseForm", "language", "conjugations"]
            }
          }
        ],
        function_call: "auto"
      })
    })

    const data = await response.json();
    const rawArguments = data.choices?.[0]?.message?.function_call?.arguments;
    const parsedArguments = rawArguments ? JSON.parse(rawArguments) : null;
    return parsedArguments as VerbConjugation | null;
  } catch (error) {
    console.error('Error fetching verb conjugation', error);
    return null;
  }
}

export const evaluateObjectiveCompletion = async (
  npc: DynamicNPC,
  objective: NPCObjective,
  conversationHistory: { role: string; text: string }[]
): Promise<boolean> => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: `You are an evaluator. Based on the conversation below, determine if the player has achieved the following objective: "${objective.description}". Respond with ONLY "yes" or "no".` },
          ...conversationHistory.map((entry) => ({
            role: entry.role === "player" ? "user" : "assistant",
            content: entry.text,
          })),
        ],
        max_tokens: 5,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content.trim().toLowerCase() === "yes";
  } catch (error) {
    console.error("Error evaluation objective completion", error);
    return false;
  }
}
