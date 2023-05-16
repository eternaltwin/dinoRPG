import { MapZone } from "../enums/MapType.mjs";
import { PlaceIcon } from "../enums/PlaceIcon.mjs";


export class PlaceDisplayed {
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
