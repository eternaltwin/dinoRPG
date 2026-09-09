import { Condition } from '../npc/NpcConditions.mjs';
import { Rewarder } from '../reward/Rewarder.mjs';
import { MissionStep } from './missionSteps.mjs';

export interface Mission {
	missionId: number;
	missionName: string;
	/** Level this mission is balanced for. Drives the xp bonus/malus - see missionXpMultiplier. */
	level: number;
	condition?: Condition;
	rewards: Rewarder[];
	steps: MissionStep[];
}
