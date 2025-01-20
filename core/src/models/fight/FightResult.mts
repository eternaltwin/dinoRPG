import { FightStep } from './FightStep.mjs';
import { FighterResultFiche, FighterType } from './DetailedFighter.mjs';
import { Monster } from './MonsterList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { FightText } from '../missions/specialActions.mjs';

export interface FightResult {
	fighters: FighterRecap[];
	goldEarned: number;
	xpEarned: number;
	levelUp: boolean;
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
	startText?: FightText;
	endText?: FightText;
	itemWon?: number;
}

export interface FighterRecap {
	id: number;
	type: FighterType;
	name: string;
	display: string | undefined;
	attacker: boolean;
	maxHp: number;
	startingHp: number;
	energy: number;
	maxEnergy: number;
	energyRecovery: number;
	dark?: boolean;
	size?: number;
}

export interface CatchResult {
	dinozId: number;
	monsterId: Monster;
	hp: number;
	id?: number;
}

export type FightStats = {
	// Total starting HP
	startingHp: number;
	// Total HP lost
	hpLost: number;
	// Total HP healed
	hpHealed: number;
	// Total attacks
	attacks: number;
	// Total multi-hits
	multiHits: number;
	// Total assaults
	assaults: number;
	// Total evasions
	evasions: number;
	// Total counters
	counters: number;
	// Total times poison was applied to an opponent
	poisoned: number;
	// Total damage dealt with poison to an opponent
	poison_damage: number;
	// Total damage dealt with burn to an opponent
	burn_damage: number;
	// Total reinforcements called (e.g. clone, korgon, etc.)
	reinforcements: number;
	// Total times (not total duration) petrification was applied to an opponent
	petrified: number;
	elements: Record<
		ElementType,
		{
			// Total damage dealt in one element
			damage_dealt: number;
			// Total number of attacks carried in one element
			attacks: number;
			// Total damage received in one element
			damage_received: number;
			// Total number of times an attack was received
			defenses: number;
		}
	>;
};

export interface FightProcessResult {
	// Seed used for the fight
	seed: string;
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
	stats: FullFightStats;
	place: PlaceEnum;
	fighters: FighterRecap[];
}

export interface FullFightStats {
	attack: FightStats;
	defense: FightStats;
}
