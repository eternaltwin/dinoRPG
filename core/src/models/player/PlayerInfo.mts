import { DinozFiche } from "../dinoz/DinozFiche.mjs";

export interface PlayerInfo {
	dinozCount: number;
	rank: number;
	pointCount: number;
	subscribeAt: string;
	clan?: string;
	playerName: string;
	dinoz: Array<DinozFiche>;
	epicRewards: Array<number>;
	customText: string | null;
}
