import { InventoryItem } from "./Item";

export interface Player {
  name: string;
  money: number;
  rizz: number;
  inventory: InventoryItem[];
  health: number;
  maxHealth: number;
}
