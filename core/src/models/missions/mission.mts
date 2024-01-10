import { Condition } from '../npc/NpcConditions.mjs';
import { Rewarder } from '../reward/Rewarder.mjs';
import { MissionStep } from './missionSteps.mjs';

export interface Mission {
	missionId: number;
	missionName: string;
	condition?: Condition;
	rewards: Rewarder[];
	steps: MissionStep[];
}
