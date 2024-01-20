import { FightStep } from './FightStep.mjs';
import { FighterResultFiche } from './DetailedFighter.mjs';
import { Monster } from './MonsterList.mjs';

export interface FightResult {
	opponent: string[];
	goldEarned: number;
	xpEarned: number;
	totalHpLost: number;
	result: boolean;
	history: FightStep[];
	hpLost: {
		id: number;
		hpLost: number;
	}[];
	itemsUsed: {
		id: number;
		itemsUsed: number[];
	}[];
}

export interface CatchResult {
	dinozId: number;
	monsterId: Monster;
	hp: number;
	id?: number;
}

export interface FightProcessResult {
	// true: attackers won, false: defenders won
	winner: boolean;
	// List of attackers
	attackers: FighterResultFiche[];
	// List of defenders
	defenders: FighterResultFiche[];
	// List of catches to update
	catches: CatchResult[];
	// History of the fight
	steps: FightStep[];
}
