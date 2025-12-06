import { Area } from '../../types/Area';
import { DynamicNPC, NPCType, QuizNPC, DynamicQuizNPC } from '../../types/NPC';
import { QuizQuestionType } from '../../types/Quiz';
import { ItemType, InventoryItem } from '../../types/Item';
import { generateTransliterationQuestion } from '../../services/QuizService';

const aiNPC: DynamicNPC = {
  id: 'a2-1',
  name: 'selena',
  type: NPCType.DYNAMIC,
  speaksTargetLanguage: true,
  x: 10,
  y: 5,
  aiIdentity: "You are the players friend named Selena, please provide short simple friendly responses to your friends questions",
  initialPrompt: "नमस्ते",
  objectives: []
}

const potion: InventoryItem = {
  id: "potion",
  name: "Health Potion",
  type: ItemType.INVENTORY,
  quantity: 1,
  description: "restores one health"
}

const quizNPC: QuizNPC = {
  id: 'quiz-1',
  name: 'Quiz Master',
  type: NPCType.QUIZ,
  speaksTargetLanguage: false,
  x: 15,
  y: 9,
  questions: [
    {
      type: QuizQuestionType.ANSWER_IN_TARGET,
      prompt: "Is the sky blue?",
      correctAnswers: ["yes"]
    }
  ],
  objectives: [],
  passThreshold: 1,
  reward: potion,
  penalty: "loseHealth"
}

const transliterationQuizNPC: DynamicQuizNPC = {
  id: 'quiz-transliteration',
  name: 'Transliteration Master',
  type: NPCType.QUIZ,
  speaksTargetLanguage: false,
  x: 2,
  y: 12,
  generateQuestion: generateTransliterationQuestion,
  passThreshold: 1,
  rewardMoney: 10,
  penalty: "loseHealth",
  objectives: []
}

export const Area2: Area = {
  id: "area2",
  width: 25,
  height: 15,
  data: Array(15).fill(null).map((_, y) =>
    Array(25).fill(null).map((_, x) =>
      y < 8 ? (x < 12 ? "#9b59b6" : "#1abc9c") : (x < 12 ? "#f39c12" : "#d35400")
    )
  ),
  items: [],
  npcs: [aiNPC, quizNPC, transliterationQuizNPC],
  systemPrompt: "speak in very short, simple sentences. Avoid complex words and long responses.",
};
