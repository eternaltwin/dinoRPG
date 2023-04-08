import { FightResult } from '@drpg/core/dist/models/fight/FightResult.mjs';
import { DinozFiche } from '@drpg/core/dist/models/dinoz/DinozFiche.mjs';
import { PlayerOptions } from '@drpg/core/dist/models/player/PlayerOptions.mjs';

export interface StoreStateSession {
	dinozCount?: number;
	jwt?: string;
	money?: number;
	dinozList?: Array<DinozFiche>;
	playerId?: number;
	fight?: FightResult;
	tab: number;
	playerOptions: PlayerOptions;
}

export interface StoreStateLocal {
	langue?: string;
}
