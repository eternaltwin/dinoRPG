import { DinozFiche } from '../dinoz/DinozFiche.mjs';

export interface StoreDinoz {
	dinozCount?: number;
	dinozList?: DinozFiche[];
}
