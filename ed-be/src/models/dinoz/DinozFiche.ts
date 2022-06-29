import { Dinoz } from '../database';

export interface DinozFiche extends Dinoz {
	actions: Array<Action>;
}

export interface Action {
	name: string;
	imgName: string;
	prop?: number;
}
