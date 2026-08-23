import { FightResult } from '../fight/FightResult.mjs';
import { StartRunResult } from '../dungeon/DungeonClient.mjs';
import { LiveStatsType } from './LiveStats.mjs';

export interface StoreStateSession {
	fight?: FightResult;
	tab: number;
	fromFight: boolean;
	liveStats: LiveStatsType;
	/** Result of DungeonService.enterDungeon(), fetched by DinozActions before routing to DungeonPage. */
	dungeonRun?: StartRunResult;
}
