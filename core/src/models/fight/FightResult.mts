import { FighterResultFiche } from './FighterFiche.mjs';

export interface FightResult {
	opponent: string;
	goldEarned: number;
	xpEarned: number;
	hpLost: number;
	result: boolean;
	dinozId: number;
	history: string;
}

// This structure needs to be exactly the same as FightResult in native/src/fight/manager.rs
export interface FightProcessResult {
	// true: attackers won, false: defenders won
	winner: boolean;
	// Seed used to generate random in the fight
	seed: number;
	// List of attackers
	attackers: Array<FighterResultFiche>;
	// List of defenders
	defenders: Array<FighterResultFiche>;
	// History of the fight
	history: string;
}
