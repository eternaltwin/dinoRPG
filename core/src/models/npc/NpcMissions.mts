import { npcList } from './NpcList.mjs';

export const npcMissions = Object.values(npcList).filter(npc => npc.missions?.length);
