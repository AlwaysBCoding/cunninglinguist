export enum ItemType {
  INVENTORY = "inventory",
  SHOP = "shop",
  AREA = "area"
}

export enum ItemEffect {
  HEAL = "heal",
  INCREASE_MAX_HEALTH = "increaseMaxHealth",
  BOOST_RIZZ = "boostRizz",
  OTHER = "other"
}

export interface BaseItem {
  id: string;
  name: string;
  type: ItemType;
  consumable?: boolean;
  description?: string
  effect?: {
    type: ItemEffect,
    value: number
  }
}

export interface InventoryItem extends BaseItem {
  type: ItemType.INVENTORY;
  quantity: number;
}

export interface ShopItem extends BaseItem {
  type: ItemType.SHOP;
  price: number;
}

export interface AreaItem extends BaseItem {
  type: ItemType.AREA;
  x: number;
  y: number;
}

export type Item = InventoryItem | ShopItem | AreaItem;
