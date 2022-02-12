import { Dinoz } from '../database/index.js';

export interface PlayerInfo {
	dinozCount: number;
	rank: number;
	pointCount: number;
	subscribeAt: string;
	clan?: string;
	playerName: string;
	epicRewards: Array<number>;
	dinoz: Array<Dinoz>;
	customText: string | null;
}
