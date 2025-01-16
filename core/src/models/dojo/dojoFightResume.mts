import { FightStep } from '../fight/FightStep.mjs';
import { FighterRecap } from '../fight/FightResult.mjs';

export interface DojoFightResume {
	id: string;
	fighters: FighterRecap[];
	history: FightStep[];
	result: boolean;
	seed: string;
}
