import { Dinoz } from '@/models';
import { FightResult } from '../dinoz';

export interface StoreStateSession {
	dinozCount?: number;
	jwt?: string;
	money?: number;
	dinozList?: Array<Dinoz>;
	playerId?: number;
	fight?: FightResult;
}

export interface StoreStateLocal {
	langue?: string;
}
