import { FighterResultFiche } from './FighterFiche.mjs';

export interface FightResult {
	opponent: string[];
	goldEarned: number;
	xpEarned: number;
	totalHpLost: number;
	result: boolean;
	history: string;
	hpLost: {
		id: number;
		hpLost: number;
	}[];
	itemsUsed: {
		id: number;
		itemsUsed: number[];
	}[];
}

// This structure needs to be exactly the same as FightResult in native/src/fight/manager.rs
export interface FightProcessResult {
	// true: attackers won, false: defenders won
	winner: boolean;
	// Seed used to generate random in the fight
	seed: number;
	// List of attackers
	attackers: FighterResultFiche[];
	// List of defenders
	defenders: FighterResultFiche[];
	// History of the fight
	history: string;
}
