import { MapZone } from '../enums/MapZone.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { placeList } from './PlaceList.mjs';

export type Place = typeof placeList[keyof typeof placeList] & {
	borderPlace: readonly number[];
};
