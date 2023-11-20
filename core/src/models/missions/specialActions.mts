import { Condition } from '../npc/NpcConditions.mjs';
import { Rewarder } from '../reward/Rewarder.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export interface SpecialActions {
	place: number;
	condition: Condition;
	opponents?: MonsterFiche[];
	reward: Rewarder[];
}
