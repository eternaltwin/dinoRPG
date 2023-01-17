import { DinozFiche, PlayerOptions } from '../index.js';

export interface PlayerCommonData {
	money: number;
	dinoz: Array<DinozFiche>;
	dinozCount: number;
	id: number;
	playerOptions: PlayerOptions;
}
