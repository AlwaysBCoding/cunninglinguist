export interface DictionaryEntry {
  word: string;
  transliteration?: string;
  definitions: {
    partOfSpeech:
    | "noun" | "proper_noun" | "pronoun"
    | "verb" | "modal_verb" | "auxiliary_verb"
    | "adjective" | "adverb"
    | "preposition" | "conjunction" | "determiner" | "article"
    | "interjection" | "numeral";
    seenCount: number;
    lastSeenAt: Date;
    definition?: string;
    example?: string;
  }[];
}

export interface Dictionary {
  [word: string]: DictionaryEntry;
}
