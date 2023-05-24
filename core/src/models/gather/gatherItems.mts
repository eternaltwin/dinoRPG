import { Condition } from "../npc/NpcConditions.mjs";

export interface GatherItems {
  type: 'ingredient' | 'item'
  ingredientId: number;
  count: number;
  condition?: Condition
}
