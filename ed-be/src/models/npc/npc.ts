import { NpcTrigger } from '../enums/index.js';
import { NpcData } from './NpcData.js';

export interface Npc {
	name: string;
	id: number;
	placeId: number;
	condition: NpcTrigger;
	conditionID?: Array<number>;
	data: Readonly<Record<string, NpcData>>;
}
