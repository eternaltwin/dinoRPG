import { Rewarder } from '../reward/Rewarder.mjs';
import { Condition } from '../npc/NpcConditions.mjs';

export interface DigData {
	name: string;
	place: number;
	reward: Rewarder[];
	condition: Condition;
}
