import { InventoryItem, ItemType, ItemEffect } from "../types/Item";

export const healthPotion: InventoryItem = {
  id: 'health-potion',
  name: "Health Potion",
  type: ItemType.INVENTORY,
  quantity: 1,
  consumable: true,
  effect: {
    type: ItemEffect.HEAL,
    value: 1
  }
}
