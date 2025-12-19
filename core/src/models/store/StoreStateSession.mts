import { FightResult } from '../fight/FightResult.mjs';
import { LiveStatsType } from './LiveStats.mjs';

export interface StoreStateSession {
	fight?: FightResult;
	tab: number;
	fromFight: boolean;
	liveStats: LiveStatsType;
}
