import { Condition } from '../npc/NpcConditions.mjs';
import { Rewarder } from '../reward/Rewarder.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export interface SpecialActions {
	place: number;
	condition: Condition;
	opponents?: MonsterFiche[];
	reward: Rewarder[];
	startText?: FightText;
	endText?: FightText;
}

export interface FightText {
	type: 'message' | 'announce';
	text: string;
}

export interface DialogText {
	message: string;
	fid: number;
}
