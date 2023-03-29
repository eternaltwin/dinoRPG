import { MapZone } from "../enums/MapZone.mjs";

export interface Place {
	placeId: number;
	name: string;
	borderPlace: Array<number>;
	conditions?: number;
	alias?: number;
	map: MapZone;
}
