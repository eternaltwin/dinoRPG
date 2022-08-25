import { DinozFiche } from '../index.js';

export interface PlayerCommonData {
	money: number;
	dinoz: Array<DinozFiche>;
	dinozCount: number;
	id: number;
}
