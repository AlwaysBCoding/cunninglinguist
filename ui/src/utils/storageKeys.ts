export const STORAGE_KEYS = {
  GAME_STATE: "plaerGameState",
  DICTIONARY: "playerDictionary"
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
