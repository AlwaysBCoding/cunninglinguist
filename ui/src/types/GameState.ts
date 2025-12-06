import { NPC } from './NPC';
import { Player } from './Player';
import { LanguageSetting } from './Language';
import { CryptexAnalysis } from './Cryptex';

export interface GameState {
  sourceLanguage: LanguageSetting;
  targetLanguage: LanguageSetting;
  currentAreaIndex: number;
  collectedItems: { [areaId: string]: string[] };
  completedObjectives: { [npcId: string]: string[] };
  player: Player;
  playerX: number;
  playerY: number;
  dialogue: string | null;
  activeNPC: NPC | null;
  currentDialogueIndex: number | null;
  conversationHistory: { role: 'player' | 'npc'; text: string; }[];
  cryptexAnalysis: CryptexAnalysis | null;
}
