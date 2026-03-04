import { StatTracking } from '../enums/statTracking.mjs';

export type ArchivedPlayerStats = {
	stat_key: StatTracking;
	score: number;
	rarity: number;
};
