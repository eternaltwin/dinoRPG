import { Map, PlaceIcon } from '@/enums';

export interface Place {
	placeId: number;
	name: string;
	posLeft: number;
	posTop: number;
	icon: PlaceIcon;
	map: Map;
	hidden: boolean;
	alias?: number;
	xFactor: number;
	yFactor: number;
}
