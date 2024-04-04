import { FightStep } from './FightStep.mjs';
import { FighterResultFiche } from './DetailedFighter.mjs';
import { Monster } from './MonsterList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';

export interface FightResult {
	fighters: FighterRecap[];
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
	place: PlaceEnum;
}

export interface FighterRecap {
	id: number;
	name: string;
	display: string | undefined;
	attacker: boolean;
	maxHp?: number;
	startingHp?: number;
	energy?: number;
	maxEnergy?: number;
}

export interface CatchResult {
	dinozId: number;
	monsterId: Monster;
	hp: number;
	id?: number;
}

export type FightStats = {
	startingHp: number;
	hpLeft: number;
	damageReceived: number;
	hpHealed: number;
	attacks: number;
	groupAttacks: number;
	multiHits: number;
	assaults: number;
	evasions: number;
	counters: number;
	poisoned: number;
	petrified: number;
	elements: Record<
		ElementType,
		{
			damage: number;
			attacks: number;
		}
	>;
};

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
	// Stats
	stats: {
		attack: FightStats;
		defense: FightStats;
	};
	place: PlaceEnum;
	fighters: FighterRecap[]
}
