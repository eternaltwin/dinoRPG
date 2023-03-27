import { Rewarder } from '../reward/Rewarder.js';
import { Condition } from '../npc/index.js';

export interface DigData {
	name: string;
	place: number;
	reward: Array<Rewarder>;
	condition: Condition;
}
