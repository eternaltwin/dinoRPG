import { Rewarder } from '../reward/Rewarder.mjs';
import { Condition } from "../npc/NpcConditions.mjs";

export class DigData {
	name: string;
	place: number;
	reward: Array<Rewarder>;
	condition: Condition;
}
