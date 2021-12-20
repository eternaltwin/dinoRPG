import { Dinoz } from '../dinoz';

export interface PlayerInfo {
	dinozCount: number;
	rank: number;
	pointCount: number;
	subscribeAt: string;
	clan?: string;
	playerName: string;
	dinoz: Array<Dinoz>;
	epicRewards: Array<number>;
}
