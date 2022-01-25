import { Dinoz } from '@/models';
import { FightResult } from '../dinoz';

export interface StoreState {
	dinozCount?: number;
	jwt?: string;
	money?: number;
	dinozList?: Array<Dinoz>;
	playerId?: number;
	fight?: FightResult;
}
