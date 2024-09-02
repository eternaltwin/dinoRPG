import { Condition } from '../npc/NpcConditions.mjs';
import { Rewarder } from '../reward/Rewarder.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export interface SpecialActions {
	name?: string;
	place: number;
	condition: Condition;
	allies?: MonsterFiche[];
	opponents: MonsterFiche[];
	reward: Rewarder[];
	startText?: FightText;
	endText?: FightText;
}

export interface FightText {
	type: 'message' | 'announce';
	text: string;
}
