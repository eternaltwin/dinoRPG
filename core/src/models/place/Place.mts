import { MapZone } from "../enums/MapZone.mjs";
import { GatherType } from "../enums/GatherType.mjs";

export interface Place {
	placeId: number;
	name: string;
	borderPlace: Array<number>;
	conditions?: number;
	alias?: number;
	map: MapZone;
  gather?: GatherType
}
