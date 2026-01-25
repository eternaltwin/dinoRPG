import { FightStep } from '../fight/FightStep.mjs';
import { FighterRecap } from '../fight/FightResult.mjs';
import { PlayerInfo } from '../player/PlayerInfo.mjs';
export interface DojoFightResume {
	id: string;
	fighters: FighterRecap[];
	history: FightStep[];
	result: boolean;
	seed: string;
	leftPlayer: Pick<PlayerInfo, 'id' | 'name'> | null;
	rightPlayer: Pick<PlayerInfo, 'id' | 'name'> | null;
}
