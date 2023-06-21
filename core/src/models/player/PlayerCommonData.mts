import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { PlayerOptions } from './PlayerOptions.mjs';

export interface PlayerCommonData {
	money: number;
	dinoz: Array<DinozFiche>;
	dinozCount: number;
	id: number;
	playerOptions: PlayerOptions;
}
