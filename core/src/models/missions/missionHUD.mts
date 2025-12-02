import { NpcName } from '../npc/npc.mjs';
import { missionRequirement } from './missionRequirement.mjs';

export type MissionHUD = missionRequirement & {
	npc: NpcName;
	currentStep: number;
	progress?: number;
};
