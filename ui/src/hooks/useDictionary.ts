import { useEffect, useState } from 'react';
import { Dictionary } from '../types/Dictionary';
import { CryptexAnalysis, WordAnalysis } from '../types/Cryptex';
import { gameEvents } from '../game/GameEvents';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';

export const useDictionary = () => {
  const [dictionary, setDictionary] = useState<Dictionary>(
    loadFromLocalStorage<Dictionary>(STORAGE_KEYS.DICTIONARY, {})
  );

  const addWordToDictionary = (wordAnalysis: WordAnalysis) => {

    setDictionary((prev) => {
      const { baseForm, partOfSpeech, definition, example, transliteration } = wordAnalysis;
      const now = new Date();

      // Check if word already exists
      const existingEntry = prev[baseForm];
      let updatedDictionary: Dictionary;

      if (existingEntry) {
        const existingDefinition = existingEntry.definitions.find(
          (def) => def.partOfSpeech === partOfSpeech
        );

        if (existingDefinition) {
          updatedDictionary = {
            ...prev,
            [baseForm]: {
              ...existingEntry,
              definitions: existingEntry.definitions.map((def) =>
                def.partOfSpeech === partOfSpeech
                  ? { ...def, seenCount: def.seenCount + 1, lastSeenAt: now }
                  : def
              )
            }
          }
        } else {
          updatedDictionary = {
            ...prev,
            [baseForm]: {
              ...existingEntry,
              definitions: [
                ...existingEntry.definitions,
                {
                  partOfSpeech,
                  definition,
                  example,
                  seenCount: 1,
                  lastSeenAt: now
                }
              ]
            }
          }
        }

      } else {
        updatedDictionary = {
          ...prev,
          [baseForm]: {
            word: baseForm,
            transliteration: transliteration,
            definitions: [
              {
                partOfSpeech,
                definition,
                example,
                seenCount: 1,
                lastSeenAt: now
              }
            ]
          }
        }
      }

      saveToLocalStorage(STORAGE_KEYS.DICTIONARY, updatedDictionary);
      return updatedDictionary;
    })
  }

  useEffect(() => {
    const handleCryptexComplete = ({ analysis }: { analysis: CryptexAnalysis }) => {
      if (analysis?.sentences) {
        analysis.sentences.forEach((sentence) => {
          sentence.words.forEach(addWordToDictionary);
        });
      }
    };

    gameEvents.on("cryptexAnalysisComplete", handleCryptexComplete);
    return () => gameEvents.on("cryptexAnalysisComplete", handleCryptexComplete);
  }, []);

  return { dictionary, addWordToDictionary };
}
