import { InventoryItem, ShopItem } from "./Item";
import { LanguageSetting } from "./Language";
import { QuizQuestion } from "./Quiz";

export interface NPCObjective {
  id: string;
  description: string;
  action: "giveItem";
  item: InventoryItem;
}

export enum NPCType {
  STATIC  = "static",
  DYNAMIC = "dynamic",
  SHOP    = "shop",
  QUIZ    = "quiz"
}

export interface BaseNPC {
  id: string;
  name: string;
  speaksTargetLanguage: boolean;
  x: number;
  y: number;
  type: NPCType;
  objectives: NPCObjective[];
}

export interface DialogueNode {
  text: string;
  responses?: string[];
  next?: number[];
}

export interface StaticNPC extends BaseNPC {
  type: NPCType.STATIC;
  staticDialogue: DialogueNode[];
}

export interface DynamicNPC extends BaseNPC {
  type: NPCType.DYNAMIC;
  aiIdentity: string;
  initialPrompt: string;
}

export interface ShopNPC extends BaseNPC {
  type: NPCType.SHOP;
  shopInventory: ShopItem[];
}

export interface QuizNPC extends BaseNPC {
  type: NPCType.QUIZ;
  questions: QuizQuestion[];
  passThreshold: number;
  reward?: InventoryItem;
  penalty?: "loseHealth";
}

export interface DynamicQuizNPC extends BaseNPC {
  type: NPCType.QUIZ;
  generateQuestion: (sourceLanguage: LanguageSetting, targetLanguage: LanguageSetting) => Promise<QuizQuestion>;
  passThreshold: number;
  rewardMoney?: number;
  penalty?: "loseHealth";
}

export type NPC = StaticNPC | DynamicNPC | ShopNPC | QuizNPC | DynamicQuizNPC;
