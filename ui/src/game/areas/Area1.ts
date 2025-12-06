import { Area } from '../../types/Area';
import { AreaItem, ItemType, InventoryItem } from '../../types/Item';
import { healthPotion } from '../Items';
import { StaticNPC, DynamicNPC, NPCType } from '../../types/NPC';

const staticNPC: StaticNPC = {
  id: 'a1-1',
  name: 'merchant',
  type: NPCType.STATIC,
  speaksTargetLanguage: false,
  x: 7,
  y: 7,
  staticDialogue: [
    { text: "Hello there, traveler!", responses: ["Who are you?", "Goodbye"], next: [1, -1] },
    { text: "I'm just an old merchant.", responses: ["Do you have anything to sell?", "Goodbye"], next: [2, -1] },
    { text: "Not today, maybe next time!", responses: ["Okay, goodbye"], next: [-1] }
  ],
  objectives: []
}

const keyOfMordor: InventoryItem = {
  id: 'key-of-mordor',
  type: ItemType.INVENTORY,
  name: 'Key of Mordor',
  quantity: 1
}

const aiNPC: DynamicNPC = {
  id: 'a1-3',
  name: 'wizard',
  type: NPCType.DYNAMIC,
  speaksTargetLanguage: false,
  x: 10,
  y: 5,
  aiIdentity: "You are a wize old wizard. Answer questions cryptically, but always help the player.",
  initialPrompt: "I am the wizard, what do you want",
  objectives: [
    {
      id: 'a1-2-1',
      description: "Convince the wizard to give you the key",
      action: "giveItem",
      item: keyOfMordor
    },
    { id: "wizard_spell", description: "Ask the wizard to teach you a spell", action: "giveItem", item: healthPotion }
  ]
}

const keyOfGondor: AreaItem = {
  id: 'key-of-gondor',
  type: ItemType.AREA,
  name: 'Key of Gondor',
  x: 5,
  y: 5
}

export const Area1: Area = {
  id: 'area1',
  systemPrompt: "speak in very short, simple sentences. Avoid complex words and long responses.",
  width: 20,
  height: 20,
  data: Array(20).fill(null).map((_, y) =>
    Array(20).fill(null).map((_, x) =>
      y < 10 ? (x < 10 ? "#3498db" : "#2ecc71") : (x < 10 ? "#f1c40f" : "#e74c3c")
    )
  ),
  items: [
    keyOfGondor
  ],
  npcs: [
    staticNPC,
    aiNPC
  ]
}
