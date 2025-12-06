import { GameState } from '../types/GameState';
import { BaseItem, InventoryItem, ItemType, ItemEffect } from '../types/Item';
import { DynamicNPC } from '../types/NPC';
import { evaluateObjectiveCompletion } from '../services/OpenAIService';
import { gameEvents } from './GameEvents';

// GAME STATE
export const increaseMoney = (amount: number) => (prev: GameState): Partial<GameState> => ({
  player: { ...prev.player, money: prev.player.money + amount }
});

export const decreaseMoney = (amount: number) => (prev: GameState): Partial<GameState> => ({
  player: { ...prev.player, money: Math.max(0, prev.player.money - amount) }
});

// INVENTORY
export const addItemToInventory = (inventory: InventoryItem[], item: BaseItem): InventoryItem[] => {
  const existingItem = inventory.find((i) => i.id === item.id);
  if (existingItem) {
    return inventory.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    );
  }
  return [...inventory, { id: item.id, type: ItemType.INVENTORY, name: item.name, consumable: item.consumable, effect: item.effect, description: item.description, quantity: 1 }];
};

export const dropItemFromInventory = (itemId: string) => (prev: GameState): Partial<GameState> => ({
  player: {
    ...prev.player,
    inventory: prev.player.inventory.filter((item) => item.id !== itemId)
  }
})

export const consumeItem = (itemId: string) => (prev: GameState): Partial<GameState> => {
  const item = prev.player.inventory.find((i) => i.id === itemId);

  if (!item || !item.consumable || !item.effect) return prev;

  let updatedState: Partial<GameState> = { ...prev };

  switch (item.effect.type) {
    case ItemEffect.HEAL:
      updatedState.player = {
        ...prev.player,
        health: Math.min(prev.player.maxHealth, prev.player.health + item.effect.value),
      };
      break;

    case ItemEffect.INCREASE_MAX_HEALTH:
      updatedState.player = {
        ...prev.player,
        maxHealth: prev.player.maxHealth + item.effect.value,
        health: prev.player.health + item.effect.value,
      };
      break;

    case ItemEffect.BOOST_RIZZ:
      updatedState.player = {
        ...prev.player,
        rizz: prev.player.rizz + item.effect.value,
      };
      break;
  }

  updatedState.player!.inventory = prev.player.inventory.map((i) =>
    i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
  ).filter(i => i.quantity > 0);

  return updatedState;
};

// HEALTH
export const takeDamage = (amount: number) => (prev: GameState): Partial<GameState> => ({
  player: {
    ...prev.player,
    health: Math.max(0, prev.player.health - amount)
  }
});

export const healPlayer = (amount: number) => (prev: GameState): Partial<GameState> => ({
  player: {
    ...prev.player,
    health: Math.min(prev.player.maxHealth, prev.player.health + amount)
  }
});

export const increaseMaxHealth = (amount: number) => (prev: GameState): Partial<GameState> => ({
  player: {
    ...prev.player,
    maxHealth: prev.player.maxHealth + amount,
    health: prev.player.health + amount
  }
});

// OBJECTIVES
export const checkForCompletedObjectives = async (
  npc: DynamicNPC,
  conversationHistory: { role: string; text: string }[],
  gameState: GameState
) => {
  if (!npc.objectives) return;

  for (const objective of npc.objectives) {
    if (gameState.completedObjectives[npc.id]?.includes(objective.id)) continue;

    const isCompleted = await evaluateObjectiveCompletion(npc, objective, conversationHistory);

    if (isCompleted) {
      gameEvents.emit("objectiveCompleted", { npc, objective });
    }
  }
};
