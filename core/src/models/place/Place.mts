import { MapZone } from '../enums/MapZone.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { Condition } from '../npc/NpcConditions.mjs';

export interface Place {
	placeId: number;
	name: string;
	borderPlace: Array<number>;
	conditions?: Condition;
	alias?: number;
	map: MapZone;
	gather?: GatherType;
	specialGather?: GatherType;
}
