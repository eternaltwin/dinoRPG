import { DinozPublicFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerStats } from './PlayerStats.mjs';

export interface PlayerInfo {
	dinozCount: number;
	pointCount: number;
	subscribedAt: string;
	clan?:
		| {
				id: number;
				name: string;
		  }
		| undefined;
	name: string;
	id: string;
	dinoz: DinozPublicFiche[];
	epicRewards: number[];
	customText: string | null;
	completion: number;
	stats: PlayerStats[];
	archivedTwinoidId?: string;
}
