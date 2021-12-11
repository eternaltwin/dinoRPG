import { PlaceIcon, Map } from '@/enums';
import { Place } from '@/models';

export const placeList: Array<Place> = [
	{
		placeId: 1,
		name: 'port',
		posLeft: 230,
		posTop: 370,
		icon: PlaceIcon.HOUSE,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 2,
		name: 'market',
		posLeft: 340,
		posTop: 270,
		icon: PlaceIcon.HOUSE,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 3,
		name: 'papy',
		posLeft: 225,
		posTop: 80,
		icon: PlaceIcon.HOUSE,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 4,
		name: 'forcebrut',
		posLeft: 280,
		posTop: 215,
		icon: PlaceIcon.CAVERN,
		map: Map.DINOLAND,
		hidden: true
	},
	{
		placeId: 5,
		name: 'dinoville',
		posLeft: 92,
		posTop: 222,
		icon: PlaceIcon.CASTLE,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 6,
		name: 'universite',
		posLeft: 120,
		posTop: 150,
		icon: PlaceIcon.CHURCH,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 7,
		name: 'fountj',
		posLeft: 175,
		posTop: 235,
		icon: PlaceIcon.FOUNT,
		map: Map.DINOLAND,
		hidden: false
	},
	{
		placeId: 8,
		name: 'oree',
		posLeft: 339,
		posTop: 330,
		icon: PlaceIcon.CAVERN,
		map: Map.JUNGLE,
		hidden: false
	}
];
