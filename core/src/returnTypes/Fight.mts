import { DinozStatusId } from '../models/dinoz/StatusList.mjs';
import { FightResult } from '../models/fight/FightResult.mjs';

export type FBTournamentFightOpponentResponse = FightResult & {
	statusReward?: DinozStatusId;
};
