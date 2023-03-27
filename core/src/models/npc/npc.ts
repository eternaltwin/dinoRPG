import { NpcTrigger } from '../enums/index.js';
import { NpcData } from './NpcData.js';
import { Mission } from '../missions/index.js';

export interface Npc {
	name: string;
	id: number;
	placeId: number;
	condition: NpcTrigger;
	conditionID?: Array<number>;
	data: Readonly<Record<string, NpcData>>;
	missions?: Array<Mission>;
	flashvars?: string;
}
