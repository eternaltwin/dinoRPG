import { NpcData } from './NpcData.mjs';
import { Mission } from '../missions/mission.mjs';
import { Condition } from './NpcConditions.mjs';

export interface Npc {
	name: string;
	id: number;
	placeId: number;
	condition?: Condition;
	data: Readonly<Record<string, NpcData>>;
	missions?: Array<Mission>;
	flashvars?: string;
}
