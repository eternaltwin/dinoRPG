import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerOptions } from './PlayerOptions.mjs';

export interface PlayerCommonData {
	money: number;
	dinoz: DinozFiche[];
	dinozCount: number;
	id: number;
	name: string;
	clanId: number | undefined;
	playerOptions: PlayerOptions;
	admin: boolean;
	priest: boolean;
}
