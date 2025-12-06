import { NPC } from './NPC';
import { AreaItem } from './Item';

export interface Area {
  id: string;
  width: number;
  height: number;
  data: string[][];
  items: AreaItem[];
  npcs: NPC[];
  systemPrompt: string;
}
