import { Dinoz } from './dinoz/index.js';
import { PlayerOptions } from '../models/player/index.js';

export interface CommonData {
	money: number;
	dinoz: Array<Dinoz>;
	dinozCount: number;
	id: number;
	playerOptions: PlayerOptions;
}
