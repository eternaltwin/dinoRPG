import { FighterResultFiche } from './FighterFiche.mjs';

export class FightResult {
	opponent: string;
	goldEarned: number;
	xpEarned: number;
	hpLost: number;
	result: boolean;
	dinozId: number;
}

// This structure needs to be exactly the same as FightResult in native/src/fight/manager.rs
export class FightProcessResult {
	// true: attackers won, false: defenders won
	winner: boolean;
	attackers: Array<FighterResultFiche>;
	defenders: Array<FighterResultFiche>;
}
