import { MapZone } from '../enums/MapZone.mjs';
import { PlaceIcon } from '../enums/PlaceIcon.mjs';

export interface PlaceDisplayed {
	placeId: number;
	name: string;
	posLeft: number;
	posTop: number;
	icon: PlaceIcon;
	map: MapZone;
	hidden: boolean;
	alias?: number;
	xFactor: number;
	yFactor: number;
}
