import { DinozPublicFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerStats } from './PlayerStats.mjs';

export interface PlayerInfo {
	dinozCount: number;
	pointCount: number;
	subscribeAt: string;
	clan?: string;
	playerName: string;
	dinoz: DinozPublicFiche[];
	epicRewards: number[];
	customText: string | null;
	completion: number;
	stats: PlayerStats[];
}
