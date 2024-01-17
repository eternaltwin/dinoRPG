import { ItemFiche } from './ItemFiche.mjs';

export interface BoxOpening {
	boxType: boxType;
	items: itemProbability[];
}

export interface itemProbability {
	item: ItemFiche;
	probability: number;
}

export enum boxType {
	COMMON = 'BOX_COMMON',
	RARE = 'BOX_RARE',
	EPIC = 'BOX_EPIC',
	LEGENDARY = 'BOX_LEGENDARY'
}
