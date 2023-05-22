import { Condition } from "../npc/NpcConditions.mjs";

export interface GatherItems {
  ingredientId: number;
  count: number;
  condition?: Condition
}
