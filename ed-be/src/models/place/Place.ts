import { MapZone } from '../enums/index.js';

export interface Place {
	placeId: number;
	name: string;
	borderPlace: Array<number>;
	conditions?: number;
	alias?: number;
	map: MapZone;
}
