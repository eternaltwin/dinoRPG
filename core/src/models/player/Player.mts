import { AdminRole } from '@drpg/prisma';
import { ModerationAdminType } from '../admin/ModerationType.mjs';

export interface Player {
	id: string;
	name: string;
	eternalTwinId: string;
	banCase: ModerationAdminType;
	money: number;
	quetzuBought: number;
	dailyGridRewards: number;
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
	items: { itemId: number; quantity: number }[];
	ingredients: { ingredientId: number; quantity: number }[];
	quests: { questId: number; progression: number }[];
	customText: string | null;
	role: AdminRole;
}
