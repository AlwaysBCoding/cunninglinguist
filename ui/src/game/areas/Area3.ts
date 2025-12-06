import { Area } from '../../types/Area';
import { InventoryItem, ItemType } from '../../types/Item';
import { DynamicNPC, NPCType } from '../../types/NPC';

const generateGridData = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      (y < height / 2 ? (x < width / 2 ? "#3498db" : "#2ecc71") : (x < width / 2 ? "#f1c40f" : "#e74c3c"))
    )
  );
};

const wisdomScroll: InventoryItem = {
  id: 'wisdom-scroll',
  type: ItemType.INVENTORY,
  name: 'Wisdom Scroll',
  quantity: 1
}

const philosopherNPC: DynamicNPC = {
  id: 'socrates',
  name: 'Socrates',
  type: NPCType.DYNAMIC,
  speaksTargetLanguage: true,
  x: 7,
  y: 7,
  aiIdentity: "You are the philosopher Socrates. Always engage in deep questions and speak in the future tense.",
  initialPrompt: '...',
  objectives: [
    { id: "philosopher_riddle", description: "Solve Socrates' philosophical riddle", action: "giveItem", item: wisdomScroll }
  ]
}

const historianNPC: DynamicNPC = {
  id: 'historian',
  name: "Historian",
  type: NPCType.DYNAMIC,
  speaksTargetLanguage: false,
  x: 12,
  y: 5,
  aiIdentity: "You are a wise historian. Use your knowledge of history to color your predictions about the future.",
  initialPrompt: '...',
  objectives: []
};

export const Area3: Area = {
  id: "area3",
  width: 100,
  height: 100,
  data: generateGridData(100, 100),
  items: [],
  npcs: [philosopherNPC, historianNPC],
  systemPrompt: "Respond only in the future tense, as if everything is yet to happen."
};
