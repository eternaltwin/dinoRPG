import { Dinoz, PlayerOptions } from '../../models';
import { FightResult } from '../dinoz';

export interface StoreStateSession {
	dinozCount?: number;
	jwt?: string;
	money?: number;
	dinozList?: Array<Dinoz>;
	playerId?: number;
	fight?: FightResult;
	tab: number;
	playerOptions: PlayerOptions;
}

export interface StoreStateLocal {
	langue?: string;
}
