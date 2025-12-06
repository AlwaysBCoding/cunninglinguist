import { CryptexAnalysis } from '../types/Cryptex';
import { Item } from '../types/Item';
import { DynamicNPC, NPCObjective } from '../types/NPC';

export type GameEventType =
  | "cryptexAnalysisComplete"
  | "increaseMoney"
  | "itemCollected"
  | "itemPurchased"
  | "maxHealthIncreased"
  | "objectiveCompleted"
  | "playerDamaged"
  | "playerHealed";

export type GameEventPayload = {
  cryptexAnalysisComplete: { analysis: CryptexAnalysis };
  increaseMoney: { amount: number };
  itemCollected: { item: Item };
  itemPurchased: { itemId: string; price: number };
  maxHealthIncreased: { amount: number };
  objectiveCompleted: { npc: DynamicNPC; objective: NPCObjective };
  playerDamaged: { amount: number };
  playerHealed: { amount: number };
};

type EventListener<T extends GameEventType> = (payload: GameEventPayload[T]) => void;

class GameEventSystem {
  private listeners: Record<GameEventType, EventListener<GameEventType>[]> = {
    cryptexAnalysisComplete: [],
    increaseMoney: [],
    itemCollected: [],
    itemPurchased: [],
    maxHealthIncreased: [],
    objectiveCompleted: [],
    playerDamaged: [],
    playerHealed: [],
  };

  on<T extends GameEventType>(event: T, listener: EventListener<T>) {
    this.listeners[event].push(listener as EventListener<GameEventType>);
  }

  emit<T extends GameEventType>(event: T, payload: GameEventPayload[T]) {
    this.listeners[event].forEach((listener) => listener(payload as any));
  }

  off<T extends GameEventType>(event: T, listener: EventListener<T>) {
    this.listeners[event] = this.listeners[event].filter(
      (l) => l !== (listener as EventListener<GameEventType>)
    );
  }
}

export const gameEvents = new GameEventSystem();
