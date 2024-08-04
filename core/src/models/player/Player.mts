import { AdminRole } from '@drpg/prisma';

export interface Player {
	id: number;
	hasImported: boolean;
	name: string;
	eternalTwinId: string;
	money: number;
	quetzuBought: number;
	leader: boolean;
	engineer: boolean;
	cooker: boolean;
	shopKeeper: boolean;
	merchant: boolean;
	priest: boolean;
	teacher: boolean;
	messie: boolean;
	matelasseur: boolean;
	rewards: number[];
	items: { itemId: number; quantity: number; }[];
	ingredients: { ingredientId: number; quantity: number; }[];
	customText: string | null;
	role: AdminRole;
}
