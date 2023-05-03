import { FightResult } from '@drpg/core/models/fight/FightResult';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { PlayerOptions } from '@drpg/core/models/player/PlayerOptions';

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
