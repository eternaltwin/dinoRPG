import { DinozFiche } from '../dinoz/DinozFiche.mjs';

export interface PlayerInfo {
	dinozCount: number;
	rank: number;
	pointCount: number;
	subscribeAt: string;
	clan?: string;
	playerName: string;
	dinoz: DinozFiche[];
	epicRewards: number[];
	customText: string | null;
}
