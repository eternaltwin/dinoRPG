import { Rewarder } from '../reward/Rewarder.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export interface DigData {
	name: string;
	place: number;
	reward: Rewarder[];
	fight?: MonsterFiche[];
	condition: Condition;
}
