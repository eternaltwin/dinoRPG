import { NpcData } from './NpcData.mjs';
import { Mission } from '../missions/mission.mjs';
import { NpcTrigger } from '../enums/NpcTrigger.mjs';

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
