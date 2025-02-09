import { ItemFiche } from './ItemFiche.mjs';

export interface BoxOpening {
	boxType: BoxType;
	items: ItemProbability[];
}

export interface ItemProbability {
	item: ItemFiche;
	odds: number;
	quantity: number;
}

export enum BoxType {
	COMMON = 'BOX_COMMON',
	RARE = 'BOX_RARE',
	EPIC = 'BOX_EPIC',
	LEGENDARY = 'BOX_LEGENDARY'
}
