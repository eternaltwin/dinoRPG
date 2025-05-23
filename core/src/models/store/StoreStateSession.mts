import { FightResult } from '../fight/FightResult.mjs';

export interface StoreStateSession {
	fight?: FightResult;
	tab: number;
	fromFight: boolean;
}
