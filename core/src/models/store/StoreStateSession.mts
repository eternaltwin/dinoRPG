import { FightResult } from '../fight/FightResult.mjs';

export interface StoreStateSession {
	jwt?: string;
	fight?: FightResult;
	tab: number;
}
