import { Dinoz } from '@/models';

export interface StoreState {
	jwt?: string;
	money?: number;
	dinozList?: Array<Dinoz>;
}
