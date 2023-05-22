import { Condition } from "../npc/NpcConditions.mjs";
import { GatherItems } from "./gatherItems.mjs";
import { GatherType } from "../enums/GatherType.mjs";

export interface GatherData {
  action: string;
  type: GatherType;
  size: number;
  clicks: number;
  condition: Condition //Skill needed
  apparence: string; //skin
  items: Array<GatherItems>
}
