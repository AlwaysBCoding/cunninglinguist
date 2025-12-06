export enum QuizQuestionType {
  TRANSLATE_TO_TARGET = "translate_to_target",
  TRANSLATE_TO_SOURCE = "translate_to_source",
  ANSWER_IN_TARGET = "answer_in_target"
}

export interface QuizQuestion {
  type: QuizQuestionType;
  prompt: string;
  correctAnswers: string[];
  difficulty?: "easy" | "medium" | "hard"
}
