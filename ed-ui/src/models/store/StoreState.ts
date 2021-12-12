import { Dinoz } from '@/models';

export interface StoreState {
	dinozCount?: number;
	jwt?: string;
	money?: number;
	dinozList?: Array<Dinoz>;
}
