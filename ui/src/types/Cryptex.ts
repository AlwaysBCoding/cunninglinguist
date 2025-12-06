import { LanguageSetting } from "./Language";

export type VerbTense =
  | "present" | "past" | "future" | "imperfect" | "preterite"
  | "present_perfect" | "past_perfect" | "future_perfect" | "conditional_perfect"
  | "present_continuous" | "past_continuous" | "future_continuous" | "conditional_continuous"
  | "present_subjunctive" | "past_subjunctive" | "future_subjunctive"
  | "imperative_affirmative" | "imperative_negative"
  | "conditional" | "potential" | "obligatory" | "hypothetical";

export interface VerbConjugation {
  baseForm: string;
  language: LanguageSetting;
  conjugations: {
    [tense in VerbTense]?: {
      [person in "first" | "second" | "third"]?: {
        [pluralaity in "singular" | "plural"]?: string
      }
    }
  }
}

export interface WordAnalysis {
  word: string;
  baseForm: string;
  partOfSpeech:
  | "noun" | "proper_noun" | "pronoun"
  | "verb" | "modal_verb" | "auxiliary_verb"
  | "adjective" | "adverb"
  | "preposition" | "conjunction" | "determiner" | "article"
  | "interjection" | "numeral";
  definition: string;
  grammar?: {
    tense?: VerbTense;
    person?: "first" | "second" | "third";
    number?: "one" | "two" | "few" | "many" | "other";
    mood?: "indicative" | "subjunctive" | "imperative";
    subject?: boolean;
    object?: boolean;
    gender?: "masculine" | "feminine" | "neutral";
  };
  transliteration?: string;
  example?: string;
}

export interface PhraseAnalysis {
  phrase: string;
  type: "idiom" | "phrasal_verb" | "named_entity" | "collocation";
  definition: string;
  transliteration?: string;
  example?: string;
}

export interface SentenceStructureAnalysis {
  subject: string;
  verb: string;
  object?: string;
  tense: VerbTense;
}

export interface SentenceAnalysis {
  sourceSentence: string;
  translatedSentence: string;
  words: WordAnalysis[];
  expressions: PhraseAnalysis[];
  sentenceStructure: SentenceStructureAnalysis;
}

export interface CryptexAnalysis {
  sentences: SentenceAnalysis[];
}
