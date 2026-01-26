import { DinozFiche } from '../dinoz/DinozFiche.mjs';

export interface StoreDinoz {
	dinozList: DinozFiche[];
	currentDinozId?: number;
}
