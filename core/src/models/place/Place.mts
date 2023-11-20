import { placeList } from './PlaceList.mjs';

export type Place = (typeof placeList)[keyof typeof placeList] & {
	borderPlace: readonly number[];
};
